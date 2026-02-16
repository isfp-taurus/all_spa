import { Injectable } from '@angular/core';
import { MasterStoreKey } from '@conf/index';
import { SupportClass } from '@lib/components/support-class';
import { AlertMessageItem, AlertType } from '@lib/interfaces';
import { StaticMsgPipe } from '@lib/pipes';
import { AswContextStoreService, AswMasterService, CommonLibService } from '@lib/services';

/**
 * 支払不可情報_オフィスコードを取得するサービス
 */
@Injectable({
  providedIn: 'root',
})
export class GetUnavailablePaymentByOfficeCodeService extends SupportClass {
  private _contentId: string | undefined;
  constructor(
    private _common: CommonLibService,
    private _aswMasterService: AswMasterService,
    private _aswContextStoreSvc: AswContextStoreService,
    private _staticMsg: StaticMsgPipe
  ) {
    super();
  }

  /**
   * 支払不可情報_オフィスコードマスタからオフィスコードで検索したキャッシュを取得
   */
  public checkUnavailablePaymentByOfficeCode() {
    // ユーザ共通情報.操作オフィスコード
    const officeCode = this._aswContextStoreSvc.aswContextData.pointOfSaleId;
    // ユーザエージェント
    const userAgent = navigator.userAgent.toLowerCase();

    const paymentMethodNameList: string[] = [];

    const unavailablePaymentList: UnavailablePaymentByOfficeCodeData[] =
      this._aswMasterService.aswMaster?.[MasterStoreKey.MUNAVAILABLEPAYMENT_BYOFFICECODE][officeCode] || [];
    unavailablePaymentList
      .filter((item) => userAgent.includes(item.useragent_keyword.toLowerCase()) && item.warning_display_flg === true)
      .forEach((item) => {
        const paymentMethodName = this._staticMsg.transform('m_list_data_PD_980_' + item.payment_method);
        paymentMethodNameList.push(paymentMethodName);
      });

    if (paymentMethodNameList.length > 0) {
      // 区切り文字の取得
      const separaterComma = this._staticMsg.transform('label.separaterComma');
      const AlertMessageData: AlertMessageItem = {
        contentHtml: 'm_error_message-W1862',
        isCloseEnable: true,
        interpolateParams: { ['0']: paymentMethodNameList.join(separaterComma) },
        alertType: AlertType.WARNING,
        errorMessageId: 'W1862',
      };
      if (this._contentId) {
        this._common.alertMessageStoreService.removeAlertWarningMessage(this._contentId);
      }
      this._contentId = this._common.alertMessageStoreService.setAlertWarningMessage(AlertMessageData);
    }
  }

  /**
   * 支払不可情報_オフィスコードマスタからオフィスコードと支払方法利用可否フラグで検索したキャッシュを取得
   */
  public getUnavailablePaymentByOfficeCode() {
    // ユーザ共通情報.操作オフィスコード
    const officeCode = this._aswContextStoreSvc.aswContextData.pointOfSaleId;
    // ユーザエージェント
    const userAgent = navigator.userAgent.toLowerCase();

    const paymentMethodNameList: string[] = [];

    const unavailablePaymentList: UnavailablePaymentByOfficeCodeData[] =
      this._aswMasterService.aswMaster?.[MasterStoreKey.MUNAVAILABLEPAYMENT_BYOFFICECODE][officeCode] || [];
    unavailablePaymentList
      .filter(
        (item) => userAgent.includes(item.useragent_keyword.toLowerCase()) && item.available_payment_flg === false
      )
      .forEach((item) => {
        paymentMethodNameList.push(item.payment_method);
      });
    return paymentMethodNameList;
  }

  destroy(): void {}
}

/**
 * 支払不可情報_オフィスコードマスタからオフィスコードで検索したキャッシュの型
 */
interface UnavailablePaymentByOfficeCodeData {
  useragent_keyword: string;
  payment_method: string;
  warning_display_flg: boolean;
  available_payment_flg: boolean;
}
