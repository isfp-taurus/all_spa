/**
 * ご案内エリア
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { SupportComponent } from '../../../components/support-class';
import { DynamicContentType } from '../../../interfaces';
import { CommonLibService } from '../../../services';
import { MasterJsonKeyPrefix } from '@conf';

/**
 * ご案内エリア
 * @param isModal モーダルの場合trueに設定することでサブ画面ID,部品IDを使用して情報を取得する
 */
@Component({
  selector: 'asw-guidance-area',
  templateUrl: './guidance-area.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuidanceAreaComponent extends SupportComponent {
  public isNoticeOpen = false;
  public isTipsForUseOpen = false;

  constructor(protected _common: CommonLibService, private _changeDetector: ChangeDetectorRef) {
    super(_common);
  }

  public importantNoticeHeadline: Array<string> = [];
  public importantNoticeShutter: Array<string> = [];
  public tipsForUse: Array<string> = [];
  public modalId = '';

  /** 動的文言キーのprefix */
  public dynamicMsgKeyPrefix = MasterJsonKeyPrefix.DYNAMIC;

  init() {
    this.modalId = this.isModal ? '-sub' : '';
    this.subscribeService(
      'DebugAreaComponent_getPagefuncId',
      this._common.aswCommonStoreService.getPagefuncId$(this.isModal ? 'subPage' : 'page'),
      (data) => {
        this.setDynamicContent();
      }
    );
  }
  destroy() {}
  reload() {}

  @Input()
  public isModal = false;

  clickNoticeExpand() {
    this.isNoticeOpen = !this.isNoticeOpen;
  }

  clickTipsForUseExpand() {
    this.isTipsForUseOpen = !this.isTipsForUseOpen;
  }

  /**
   * 動的文言取得処理
   */
  private setDynamicContent() {
    this.subscribeService(
      'GuidanceAreaComponent_getDynamicContent',
      this._common.dynamicContentService.getDynamicContent$(this.isModal),
      (content) => {
        if (content) {
          this.importantNoticeHeadline = content[DynamicContentType.IMPOTANT_NOTICE_FIRST]
            ? content[DynamicContentType.IMPOTANT_NOTICE_FIRST] || []
            : [];
          this.importantNoticeShutter = content[DynamicContentType.IMPOTANT_NOTICE]
            ? content[DynamicContentType.IMPOTANT_NOTICE] || []
            : [];
          this.tipsForUse = content[DynamicContentType.TIP_FOR_USE]
            ? content[DynamicContentType.TIP_FOR_USE] || []
            : [];
        } else {
          this.importantNoticeHeadline = [];
          this.importantNoticeShutter = [];
          this.tipsForUse = [];
        }
        this._changeDetector.markForCheck();
      }
    );
  }

  /**
   * 重要なご案内の開閉ボタンのaria-controls属性取得処理
   * @returns 重要なご案内の開閉ボタンのaria-controls属性
   */
  public getControlId(importantNoticeShutter: string[]) {
    let controlId = [];
    for (let index = 0; index < importantNoticeShutter.length; index++) {
      controlId.push('notice-more-contents-' + index + this.modalId);
    }
    return controlId.join(' ');
  }
}
