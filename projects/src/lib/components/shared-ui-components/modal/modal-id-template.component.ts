/**
 * IDありモーダル画面用のテンプレート
 */
import {
  Component,
  ViewChild,
  ElementRef,
  ViewContainerRef,
  Type,
  ChangeDetectionStrategy,
  AfterViewInit,
} from '@angular/core';
import {
  SupportModalBlockComponent,
  SupportModalIdSubComponent,
  SupportModalIdComponent,
} from '../../../components/support-class';
import { CommonLibService } from '../../../services';

/**
 * IDありモーダル画面用のテンプレート
 */
@Component({
  selector: 'asw-modal-id-template',
  templateUrl: './modal-id-template.component.html',
  styleUrls: ['./modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalIdTemplateComponent extends SupportModalBlockComponent implements AfterViewInit {
  constructor(___common: CommonLibService) {
    super(___common);
  }

  // 表示コンテンツ用
  @ViewChild('emergencyArea', { read: ElementRef }) emergencyArea!: ElementRef; // 高さを取得するために使用
  @ViewChild('view', { read: ViewContainerRef }) view!: ViewContainerRef;
  @ViewChild('viewHead', { read: ViewContainerRef }) viewHead!: ViewContainerRef;
  @ViewChild('viewFoot', { read: ViewContainerRef }) viewFoot!: ViewContainerRef;

  //組み込み元からもらうコンテンツ
  public header: Type<SupportModalIdSubComponent> | null = null;
  public footer: Type<SupportModalIdSubComponent> | null = null;
  public content: Type<SupportModalIdComponent> | null = null;

  //組み込み元からもらうコンテンツをinstance化したもの
  private _instance!: SupportModalIdComponent;
  private _headerRef: SupportModalIdSubComponent | null = null;
  private _footerRef: SupportModalIdSubComponent | null = null;

  reload(): void {}
  init(): void {}
  destroy(): void {}

  // コンテンツ初期化後の処理
  override ngAfterViewInit(): void {
    // 受け取ったコンポーネントを展開し、必要な情報を詰める
    if (this.content) {
      const componentRef = this.view.createComponent(this.content);
      this._instance = componentRef.instance;
      this._instance.payload = this.payload;
      this._instance.close = this.close;
      this._instance.resizeForce = this.resizeForce;
      this._instance.getScrollParam = this.getScrollParam;
      this._instance.setScroll = this.setScroll;
      if (this.header) {
        const headerRef = this.viewHead.createComponent(this.header);
        this._headerRef = headerRef.instance;
        this._instance.headerRef = headerRef.instance;
        this._headerRef.payload = this.payload;
        this._headerRef.close = this.close;
        this._headerRef.resizeForce = this.resizeForce;
        this._headerRef.getScrollParam = this.getScrollParam;
        this._headerRef.setScroll = this.setScroll;
        headerRef.hostView.detectChanges(); //ModalBaseComponentと同じ理由で子コンポーネントのView更新が必要
      }
      if (this.footer) {
        const footerRef = this.viewFoot.createComponent(this.footer);
        this._footerRef = footerRef.instance;
        this._instance.footerRef = footerRef.instance;
        this._footerRef.payload = this.payload;
        this._footerRef.close = this.close;
        this._footerRef.resizeForce = this.resizeForce;
        this._footerRef.getScrollParam = this.getScrollParam;
        this._footerRef.setScroll = this.setScroll;
        footerRef.hostView.detectChanges(); //ModalBaseComponentと同じ理由で子コンポーネントのView更新が必要
      }
      componentRef.hostView.detectChanges(); //ModalBaseComponentと同じ理由で子コンポーネントのView更新が必要
    }
    //緊急案内エリアは範囲外なので計算のために高さを取得
    if (this.emergencyArea) {
      this.manualMargin = this.emergencyArea.nativeElement.offsetHeight;
      this.emergencyAreaObserver.observe(this.emergencyArea.nativeElement); //この値はリサイズのたびにセットする必要があるので
    }
    super.ngAfterViewInit();
  }

  private emergencyAreaObserver = new ResizeObserver(() => {
    this.manualMargin = this.emergencyArea.nativeElement.offsetHeight;
  });

  /**
   * 画面側からの手動リサイズ用　どうしても検知できないときなどに呼び出す
   */
  public resizeForce = () => {
    this.resize();
  };

  public onClickCloseBack(): void {}
}
