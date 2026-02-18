/**
 * 注意喚起エリア
 *
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { SupportComponent } from '../../../components/support-class';
import { AlertMessageItem, AlertType, DynamicContentType } from '../../../interfaces';
import { CommonLibService } from '../../../services';

/**
 * 注意喚起エリア
 *
 * @param isModal モーダルの場合trueに設定することでstoreからモーダル用の情報を取得する
 *
 */
@Component({
  selector: 'asw-alert-area',
  templateUrl: './alert-area.component.html',
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertAreaComponent extends SupportComponent {
  public alertWarningMessageList: AlertMessageItem[] = [];
  public alertInfomationMessageList: AlertMessageItem[] = [];
  public alertInfomationDynamicMessageList: AlertMessageItem[] = [];
  private previousFundId: string | undefined = '';
  private previousPageId: string | undefined = '';
  private previousSubFundId: string | undefined = '';
  private previousSubPageId: string | undefined = '';

  constructor(private _common: CommonLibService, private _changeDetector: ChangeDetectorRef) {
    super(_common);
  }

  @Input()
  isModal = false;

  init() {
    this.subscribeService(
      'AlertAreaComponent_getAlertMessageObservable',
      this._common.alertMessageStoreService.getAlertMessage$(),
      (alertMessage) => {
        // storeの情報を取得
        const _alertWarningMessageList = this.isModal ? alertMessage.subWarningMessage : alertMessage.warningMessage;

        //ワーニングの場合ワーニングコードがある場合自動設定
        this.alertWarningMessageList = _alertWarningMessageList.map((warn) => {
          if (warn.errorMessageId) {
            const funcId = this.isModal
              ? this._common.aswCommonStoreService.aswCommonData.subFunctionId ?? ''
              : this._common.aswCommonStoreService.aswCommonData.functionId ?? '';
            const pageId = this.isModal
              ? this._common.aswCommonStoreService.aswCommonData.subPageId ?? ''
              : this._common.aswCommonStoreService.aswCommonData.pageId ?? '';

            const prefix = funcId || pageId ? `${funcId}${pageId}-` : '';
            const suffix = warn.apiErrorCode ? `-${warn.apiErrorCode}` : '';
            const displayKey = `(${prefix}${warn.errorMessageId}${suffix})`;
            return { ...warn, displayKey };
          }
          return warn;
        });

        this.alertInfomationMessageList = this.isModal
          ? alertMessage.subInfomationMessage
          : alertMessage.infomationMessage;
        this._changeDetector.markForCheck();
      }
    );
    this.setDynamicContent();
  }
  destroy() {}
  reload() {}

  /**
   * 動的文言取得処理
   */
  private setDynamicContent() {
    this.subscribeService(
      'AlertAreaComponent_getDynamicContent',
      this._common.dynamicContentService.getDynamicContent$(this.isModal),
      (content) => {
        this.alertInfomationDynamicMessageList = [];
        this.clearAlertInfomationMessageCloseList();
        if (content && content[DynamicContentType.ALERT_INFOMATION]) {
          content[DynamicContentType.ALERT_INFOMATION].map((str) => {
            const contentId = 'dynamic' + str;
            const messageItem = <AlertMessageItem>{
              contentId: contentId,
              contentHtml: str,
              isCloseEnable: true,
              alertType: AlertType.INFOMATION,
            };
            this.alertInfomationDynamicMessageList.push(messageItem);
          });
        }
        this._changeDetector.markForCheck();
      }
    );
  }

  /**
   * 注意喚起情報クローズ済みリストクリア
   */
  private clearAlertInfomationMessageCloseList() {
    if (this.isModal) {
      if (
        this.previousSubFundId !== this._common.aswCommonStoreService.aswCommonData.subFunctionId ||
        this.previousSubPageId !== this._common.aswCommonStoreService.aswCommonData.subPageId
      ) {
        this.previousSubFundId = this._common.aswCommonStoreService.aswCommonData.subFunctionId;
        this.previousSubPageId = this._common.aswCommonStoreService.aswCommonData.subPageId;
      }
    } else {
      if (
        this.previousFundId !== this._common.aswCommonStoreService.aswCommonData.functionId ||
        this.previousPageId !== this._common.aswCommonStoreService.aswCommonData.pageId
      ) {
        this.previousFundId = this._common.aswCommonStoreService.aswCommonData.functionId;
        this.previousPageId = this._common.aswCommonStoreService.aswCommonData.pageId;
      }
    }
  }

  closeInfomationDynamic(id: string) {
    const index = this.alertInfomationDynamicMessageList.findIndex((aI) => aI.contentId === id);
    this.alertInfomationDynamicMessageList.splice(index, 1);
  }

  closeInfomation(id: string) {
    if (this.isModal) {
      this._common.alertMessageStoreService.removeAlertSubInfomationMessage(id);
    } else {
      this._common.alertMessageStoreService.removeAlertInfomationMessage(id);
    }
  }

  closeWarning(id: string) {
    if (this.isModal) {
      this._common.alertMessageStoreService.removeAlertSubWarningMessage(id);
    } else {
      this._common.alertMessageStoreService.removeAlertWarningMessage(id);
    }
  }
}
