import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { TempUrlType, TemporaryUrlModalParams } from '@common/interfaces';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService } from '@lib/services';
import { TemporaryUrlModalService } from './temporary-url-modal.service';

/**
 * 一時URL表示モーダル
 */
@Component({
  selector: 'asw-temporary-url-modal',
  templateUrl: './temporary-url-modal.component.html',
  styleUrls: ['./temporary-url-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemporaryUrlModalComponent extends SupportModalBlockComponent implements AfterViewChecked {
  /** 一時URL */
  public temporaryUrl = '';

  /** モーダルタイトル静的文言 */
  public modalTitle = '';

  /** 一時URL説明文静的文言 */
  public urlDescription = '';

  /** コピーボタン読み上げ用ラベル */
  public copyBtnReader = '';

  /** payload */
  public override payload: TemporaryUrlModalParams = {
    type: TempUrlType.DPL,
    url: '',
  };

  /** 一時URLテキストボックスのElementRef */
  @ViewChild('temporaryUrlBox')
  private _temporaryUrlBox: ElementRef<HTMLInputElement> = {} as ElementRef;

  constructor(
    private _common: CommonLibService,
    private _staticMsgPipe: StaticMsgPipe,
    private _temporaryUrlModalService: TemporaryUrlModalService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    super(_common);
  }

  init(): void {
    // 一時URL種別に応じた静的文言(モーダルタイトル用)を取得
    const temporaryUrlType = this.payload.type;
    switch (temporaryUrlType) {
      case TempUrlType.DPL:
        this.modalTitle = this._staticMsgPipe.transform('label.planLinkModalTitle');
        this.urlDescription = this._staticMsgPipe.transform('label.deepLinkDescription');
        this.copyBtnReader = this._staticMsgPipe.transform('reader.copyPlanLink');
        break;
      case TempUrlType.SHR:
        this.modalTitle = this._staticMsgPipe.transform('label.sharePlanModalTitle');
        this.urlDescription = this._staticMsgPipe.transform('label.planShareDescription');
        this.copyBtnReader = this._staticMsgPipe.transform('reader.copySharePlan');
        break;
      case TempUrlType.MIG:
        this.modalTitle = this._staticMsgPipe.transform('label.openThePlanOnAnotherDevice');
        this.urlDescription = this._staticMsgPipe.transform('label.planMigrationDescription');
        this.copyBtnReader = this._staticMsgPipe.transform('alt.copyUrl');
        break;
      default:
        break;
    }

    // テキストボックスに入れるURLを設定
    this._temporaryUrlModalService.addQueryParamsNext(this.payload.url, (urlWithParams) => {
      this.temporaryUrl = urlWithParams;
      this._changeDetectorRef.detectChanges();
    });
  }

  reload(): void {}

  destroy(): void {}

  ngAfterViewChecked(): void {
    this.resize();
    this._changeDetectorRef.markForCheck();
  }

  /**
   * 一時URLコピーボタン押下時処理
   */
  copyUrlToClipboard(): void {
    const url: string = this._temporaryUrlBox.nativeElement.value;
    if (typeof navigator.clipboard === 'object') {
      navigator.clipboard.writeText(url);
    } else {
      // navigator.clipboard非対応ブラウザ向けの処理
      document.execCommand(url);
    }
  }

  /**
   * 閉じるボタン押下時処理
   */
  clickClose() {
    this.close();
  }
}
