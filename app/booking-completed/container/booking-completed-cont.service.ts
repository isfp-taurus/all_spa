import { Injectable } from '@angular/core';
import { submitNavigate, transform } from '@common/helper';
import { PaymentMethodsType } from '@common/interfaces/common/payment-methods';
import { DeliveryInformationState } from '@common/store';
import { environment } from '@env/environment';
import { SupportClass } from '@lib/components/support-class';
import { ApiCommonRequest, SessionStorageName, AswServiceModel } from '@lib/interfaces';
import { LinkUrlPipe, StaticMsgPipe } from '@lib/pipes';
import { CommonLibService } from '@lib/services';
import { GetOrderRequest, GetOrderResponseData } from 'src/sdk-servicing';
import { DisplayInfoJSON } from './booking-completed-cont.state';
import { Buffer } from 'buffer';
/**
 * 予約購入完了画面 cont サービス
 */
@Injectable({
  providedIn: 'root',
})
export class BookingCompletedContService extends SupportClass {
  constructor(public staticMsg: StaticMsgPipe, private _common: CommonLibService, private _linkUrl: LinkUrlPipe) {
    super();
  }
  destroy(): void {}

  /**
   * 画面タイトルラベルの取得
   * @param orderStatus オーダーステータス
   * @return 画面タイトルラベル
   */
  public getTitleLabel(orderStatus: string) {
    return orderStatus === GetOrderResponseData.OrderStatusEnum.Unpurchased ||
      orderStatus === GetOrderResponseData.OrderStatusEnum.reservationOnly ||
      orderStatus === GetOrderResponseData.OrderStatusEnum.applyingForTicketing ||
      orderStatus === GetOrderResponseData.OrderStatusEnum.waitlisted
      ? 'label.reservationComplete2'
      : 'label.purchaseComplete2';
  }

  /**
   * 完了メッセージの取得
   * @param orderStatus オーダーステータス
   * @return 完了メッセージ
   */
  public getDisplayLabel(orderStatus: string) {
    switch (orderStatus) {
      case GetOrderResponseData.OrderStatusEnum.Unpurchased:
        return 'label.reservationComplete1';
      case GetOrderResponseData.OrderStatusEnum.reservationOnly:
        return 'label.reservationComplete1';
      case GetOrderResponseData.OrderStatusEnum.waitlisted:
        return 'label.reservationComplete1';
      case GetOrderResponseData.OrderStatusEnum.applyingForTicketing:
        return 'label.applyPurchaseComplete';
      default:
        return 'label.purchaseComplete1';
    }
  }

  /**
   * 手荷物ルール取得APIリクエストの作成
   * @param order PNR情報
   * @returns 手荷物ルール取得APIリクエストパラメータ
   */
  public createFareConditionsRequestParam(order?: GetOrderResponseData) {
    return {
      orderId: order?.orderId,
      credential: {
        firstName: order?.travelers?.[0]?.names?.[0]?.firstName,
        lastName: order?.travelers?.[0]?.names?.[0]?.lastName,
      },
      commonIgnoreErrorFlg: true,
    };
  }

  /**
   * PNR情報取得API実行のためのパラメータを作成
   * @param beforeData 更新前PNR情報
   * @returns PNR情報取得APIのリクエストパラメータ
   */
  createGetOrderRequest(beforeData?: GetOrderResponseData): GetOrderRequest & ApiCommonRequest {
    return {
      orderId: beforeData?.orderId,
      credential: {
        firstName: beforeData?.travelers?.[0]?.names?.[0]?.firstName,
        lastName: beforeData?.travelers?.[0]?.names?.[0]?.lastName,
      },
      commonIgnoreErrorFlg: true,
      getServiceCatalogue: false,
    };
  }

  /**
   * 画面情報JSON作成
   */
  setDisplayInfoJSON(delivery?: DeliveryInformationState): DisplayInfoJSON {
    const jsonData: DisplayInfoJSON = {
      paymentMethod: delivery?.paymentInformation?.paymentMethod ?? '',
      is3DSecureApplied: delivery?.paymentInformation?.is3DSPayment ?? false,
      isCashSettlement: [
        '' + PaymentMethodsType.PAYPAL,
        '' + PaymentMethodsType.CONVENIENCE_STORE,
        '' + PaymentMethodsType.INTERNET_BANKING,
      ].includes(delivery?.paymentInformation?.paymentMethod ?? ''),
    };

    // upsellがあれば追加する
    if (delivery?.planReviewInformation?.upsellAmount !== undefined) {
      jsonData.upsellAmount = {
        outbound: delivery?.planReviewInformation?.upsellAmount?.outbound,
        inbound: delivery?.planReviewInformation?.upsellAmount?.inbound,
      };
    }
    return jsonData;
  }

  /** ASW TOPへ遷移 */
  returnToAswTop() {
    const url = this._common.aswMasterService.getMPropertyByKey('application', 'topServer');
    window.location.href = this._linkUrl.transform(url);
  }

  //APIから受け取ったPDFファイルを変換し表示
  /**
   * Base64データのPDFを変換して別タブで表示する
   * @param binary Base64データのPDF文字列
   * @param pdfWindow pdf表示用のウィンドウ
   */
  Base64ToPdfOpen(binary: string, pdfWindow: WindowProxy) {
    const uintArray = Buffer.from(binary, 'base64');
    const blob = new Blob([uintArray], { type: 'application/pdf' });
    const file = new File([blob], '', { type: 'application/pdf' });
    const url = URL.createObjectURL(file);

    // ポップアップウィンドウにPDFを表示するためのembed要素を追加する
    const embedDom = pdfWindow.document.createElement('embed');
    embedDom.src = `${url}#toolbar=1`;
    embedDom.style.width = '100vw';
    embedDom.style.height = '100vh';

    // ポップアップウィンドウのbodyにembed要素を追加する
    pdfWindow.document.body.appendChild(embedDom);
  }

  /**
   * 予約詳細へ遷移
   * @param next 次のアクション
   * @param getOrder PNRレスポンスデータ
   */
  goToMyBooking(next: string, getOrder?: GetOrderResponseData) {
    // BookingSearchModelの搭乗者の方に合わせて搭乗者名を変換
    let travelersStr = '';
    for (let trav of getOrder?.travelers ?? []) {
      if (travelersStr !== '') {
        travelersStr += ',';
      }
      travelersStr += (trav.names?.[0]?.firstName ?? '') + '/' + (trav.names?.[0]?.lastName ?? '');
    }

    // BookingSearchModelに従いパラメータ作成
    const queryParams = {
      searchType: 'order',
      orderId: getOrder?.orderId ?? '',
      eTicketNumber: '',
      firstName: getOrder?.travelers?.[0]?.names?.[0]?.firstName ?? '',
      lastName: getOrder?.travelers?.[0]?.names?.[0]?.lastName ?? '',
      SITE_ID: 'ALL_APP',
      nextAction: next,
      JourneyId: '',
      flightIdList: '',
      JSessionId: '',
      aswIntErrorId: '',
      errorId: '',
      warningId: '',
      travelers: travelersStr,
      CONNECTION_KIND: 'ZZZ', // 接続種別
    };

    // 予約検索画面(S01-P010)へ遷移
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    const identificationId = this._common.loadSessionStorage(SessionStorageName.IDENTIFICATION_ID);
    const url = transform(
      environment.spa.baseUrl + environment.spa.app.srv + '/booking-search',
      lang,
      identificationId
    );
    const name = getOrder?.travelers?.[0]?.names?.[0] ?? {};
    this.updateService(getOrder?.orderId ?? '', name.lastName ?? '', name.firstName ?? '');
    submitNavigate(url, queryParams);
  }

  /**
   * セッションストレージのサービス共通情報を更新する
   * @param orderId 予約番号
   * @param lastName 姓
   * @param firstName 名
   */
  private updateService(orderId: string, lastName: string, firstName: string): void {
    const aswService: AswServiceModel = {
      orderId: orderId ?? '',
      lastName: lastName ?? '',
      firstName: firstName ?? '',
    };
    this._common.saveSessionStorage(aswService ?? '', SessionStorageName.ASW_SERVICE, true);
  }
}
