import { Injectable } from '@angular/core';
import { apiEventAll } from '@common/helper';
import { PaymentMethodsType } from '@common/interfaces/common/payment-methods';
import {
  CurrentCartStoreService,
  OrdersRepriceOrderStoreService,
  RefreshAmcmemberBalanceStoreService,
} from '@common/services';
import { OrdersRepriceOrderState, RefreshAmcmemberBalanceState } from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { AMCMemberType, ApiCommonRequest, AswServiceModel } from '@lib/interfaces';
import { AMCMemberStoreService, CommonLibService, LoggerDatadogService } from '@lib/services';
import {
  OrdersRepriceOrderRequest,
  PaymentRequestPayerIdentification,
  PaymentRequestPaymentCard,
  PaymentRequestSkycoin,
} from 'src/sdk-reservation';
import {
  AnaSkyCoinInfo,
  PaymentInputCardInfo,
  PaymentInputCardHolderInfo,
  PreviousScreenHandoverInformation,
} from '../container';
import { RegisteredCardTypeEnum } from '../sub-components';
import { ErrorCodeConstants } from '@conf/app.constants';

@Injectable({ providedIn: 'root' })
export class PaymentInputPresService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _ordersRepriceOrderStoreService: OrdersRepriceOrderStoreService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _refreshAmcmemberBalanceRequestService: RefreshAmcmemberBalanceStoreService,
    private _amcMemberService: AMCMemberStoreService,
    private _loggerSvc: LoggerDatadogService
  ) {
    super();
  }

  /**
   * 購入発券API用クレジットカード情報取得
   * @param selectedCard 選択されているカード
   * @param creditCardInfo 画面クレジットカード情報
   * @returns クレジットカード情報
   */
  public getPaymentCardInfo(
    selectedCard: RegisteredCardTypeEnum,
    creditCardInfo: PaymentInputCardInfo
  ): PaymentRequestPaymentCard | undefined {
    return {
      registeredCardType:
        selectedCard === RegisteredCardTypeEnum.NewCard
          ? undefined
          : (selectedCard as PaymentRequestPaymentCard.RegisteredCardTypeEnum),
      cardNumber: selectedCard === RegisteredCardTypeEnum.NewCard ? creditCardInfo.cardNumber : undefined,
      holderName: creditCardInfo.ownerName ?? '',
      expiryDate: creditCardInfo.cardExpiryDate ?? '',
      cvv: creditCardInfo.uatpCard ? undefined : creditCardInfo.cvv,
      isUatpCard: creditCardInfo.uatpCard,
      saveAsBasicReservationInformation: creditCardInfo.reservation,
    };
  }

  /**
   * 購入発券API用クレジットカード名義人情報取得
   * @param cardHolderInfo 画面クレジットカード名義人情報
   * @param deviceId デバイスID
   * @returns クレジットカード名義人情報
   */
  public getPayerIdentificationInfo(
    cardHolderInfo: PaymentInputCardHolderInfo,
    deviceId: string
  ): PaymentRequestPayerIdentification | undefined {
    return {
      deviceFingerPrint: deviceId,
      contact: {
        email: {
          address: cardHolderInfo.email ?? '',
        },
        phone: {
          countryPhoneExtension: cardHolderInfo.phone?.countryPhoneExtension ?? '',
          number: cardHolderInfo.phone?.number ?? '',
        },
      },
    };
  }

  /**
   * 購入発券API用ANA SKYコイン利用情報取得
   * @param anaSkyCoinInfo 画面sky coin情報
   * @returns ANA SKYコイン利用情報
   */
  public getSkyCoinInfo(anaSkyCoinInfo: Array<AnaSkyCoinInfo>): PaymentRequestSkycoin {
    const skycoin: PaymentRequestSkycoin = { amounts: [] };
    // 支払にANA SKYコインを利用する場合、利用額を設定する
    anaSkyCoinInfo
      .filter((item) => !!item.usageCoin)
      .forEach((item) => {
        skycoin.amounts.push({ travelerId: item.travelerId ?? '', amount: item.usageCoin ?? 0 });
      });
    return skycoin;
  }

  /**
   * 購入時運賃再計算APIリクエストパラメータ作成
   */
  public generateOrdersRepriceApiParam(prevScreenInfo: PreviousScreenHandoverInformation): OrdersRepriceOrderRequest {
    const orderId = prevScreenInfo.orderId ?? '';
    const firstName = prevScreenInfo.credential.firstName ?? '';
    const lastName = prevScreenInfo.credential.lastName ?? '';

    const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId ?? '';
    // 購入時運賃再計算API実行のためのパラメータを作成
    return {
      orderId: orderId, // 前画面引継ぎ情報
      credential: {
        firstName: firstName, // 前画面引継ぎ情報.代表者名
        lastName: lastName, // 前画面引継ぎ情報.代表者姓
      },
      cartId: cartId,
    };
  }

  /**
   * 購入時運賃再計算API 呼び出し
   * @param ordersRepriceOrderRequestParam リクエストパラメータ
   * @param successEvent 成功時処理
   * @param errorEvent 失敗時処理
   */
  public invokeOrdersRepriceApi(
    ordersRepriceOrderRequestParam: OrdersRepriceOrderRequest,
    successEvent: (response: OrdersRepriceOrderState) => void,
    errorEvent: (error: OrdersRepriceOrderState) => void
  ) {
    apiEventAll(
      () => {
        this._ordersRepriceOrderStoreService.setOrdersRepriceOrderFromApi(ordersRepriceOrderRequestParam);
      },
      this._ordersRepriceOrderStoreService.getOrdersRepriceOrder$(),
      (response) => {
        successEvent(response);
      },
      (error) => {
        errorEvent(error);
      }
    );
  }

  /**
   * 会員情報更新処理
   * @param response 会員情報残高更新情報APIレスポンス
   */
  private _updateAmcMemberInfo(response: RefreshAmcmemberBalanceState) {
    this._amcMemberService.updateAMCMemberByKey(AMCMemberType.MILE_BALANCE, response.data?.mileBalance);
    this._amcMemberService.updateAMCMemberByKey(AMCMemberType.MILE_BALANCE_AFA, response.data?.mileBalanceAfa);
    this._amcMemberService.updateAMCMemberByKey(
      AMCMemberType.UPGRADE_POINT_BALANCE_THIS_YEAR,
      response.data?.upgradePointBalanceThisYear
    );
    this._amcMemberService.updateAMCMemberByKey(
      AMCMemberType.UPGRADE_POINT_BALANCE_NEXT_YEAR,
      response.data?.upgradePointBalanceNextYear
    );
  }

  /**
   * 会員情報残高更新情報API 呼び出し
   * @param successEvent 成功時処理
   * @param errorEvent 失敗時処理
   */
  public invokeRefreshAmcmemberBalanceApi(
    successEvent: (response: RefreshAmcmemberBalanceState) => void,
    errorEvent: (error: RefreshAmcmemberBalanceState) => void
  ) {
    // 会員情報残高更新情報APIリクエストパラメータ作成
    const requestParameter = {};
    // 会員情報残高更新情報API呼び出し
    apiEventAll(
      () => {
        this._refreshAmcmemberBalanceRequestService.setRefreshAmcmemberBalanceFromApi(requestParameter);
      },
      this._refreshAmcmemberBalanceRequestService.getRefreshAmcmemberBalance$(),
      (response) => {
        this._updateAmcMemberInfo(response);
        successEvent(response);
      },
      (error) => {
        this._loggerSvc.operationConfirmLog('API0003', { 0: this._common.apiError?.['errors']?.[0].code ?? '' });
        errorEvent(error);
      }
    );
  }

  /**
   * 会員情報残高更新情報API 呼び出し(commonIgnoreErrorFlg に「エラーハンドリング回避」を指定するy)
   * @param successEvent 成功時処理
   * @param errorEvent 失敗時処理
   */
  public invokeRefreshAmcmemberBalanceApi2(
    successEvent: (response: RefreshAmcmemberBalanceState) => void,
    errorEvent: (error: RefreshAmcmemberBalanceState) => void
  ) {
    // 会員情報残高更新情報APIリクエストパラメータ作成
    const requestParameter = {
      // commonIgnoreErrorFlg に「エラーハンドリング回避」を指定する。
      commonIgnoreErrorFlg: true,
    };
    // 会員情報残高更新情報API呼び出し
    apiEventAll(
      () => {
        this._refreshAmcmemberBalanceRequestService.setRefreshAmcmemberBalanceFromApi(requestParameter);
      },
      this._refreshAmcmemberBalanceRequestService.getRefreshAmcmemberBalance$(),
      (response) => {
        this._updateAmcMemberInfo(response);
        successEvent(response);
      },
      (error) => {
        this._loggerSvc.operationConfirmLog('API0003', { 0: this._common.apiError?.['errors']?.[0].code ?? '' });
        errorEvent(error);
      }
    );
  }

  /**
   * 支払い方法にsky coinが含まれているかどうか判定
   * @param isAnaSkyCoinCombination sky coin併用選択
   * @param selectedPaymentMethod 選択支払い方法
   * @returns ANA SKYコイン利用情報
   */
  public isSkyCoin(isAnaSkyCoinCombination: boolean, selectedPaymentMethod: PaymentMethodsType) {
    return (
      selectedPaymentMethod === PaymentMethodsType.ANA_SKY_COIN ||
      (selectedPaymentMethod === PaymentMethodsType.CREDIT_CARD && isAnaSkyCoinCombination)
    );
  }

  /**
   * 支払い方法にクレジットカードが含まれているかどうか判定
   * @param isCreditCardCombination sky coin併用選択
   * @param selectedPaymentMethod 選択支払い方法
   * @returns ANA SKYコイン利用情報
   */
  public isCreditCard(isCreditCardCombination: boolean, selectedPaymentMethod: PaymentMethodsType) {
    return (
      selectedPaymentMethod === PaymentMethodsType.CREDIT_CARD ||
      (selectedPaymentMethod === PaymentMethodsType.ANA_SKY_COIN && isCreditCardCombination)
    );
  }
  /**
   * 同意ボタン押下時に表示するメッセージID取得関数
   * @param isKeepMyFare keep my fareであるかどうか
   * @param isCreditCardCombination クレジットカード併用選択状態
   * @param paymentMethod 支払方法
   * @param isWaitlisted 空席待ち予約識別子
   * @returns ダイアログに表示するメッセージID
   */
  public paymentConfirmation(
    isKeepMyFare: boolean,
    isCreditCardCombination: boolean,
    paymentMethod: string,
    isWaitlisted: boolean
  ): string {
    let msg = '';
    if (isKeepMyFare) {
      // Keep My Fare ON の場合
      msg = 'MSG0687';
    } else if (isWaitlisted) {
      // 空席待ち予約識別子=true の場合、確認ダイアログ表示不要
      msg = '';
    } else {
      // Keep My Fare OFF の場合
      switch (paymentMethod) {
        // 予約のみ識別子
        case PaymentMethodsType.RESERVATION_ONLY:
          msg = 'MSG1488';
          break;
        // Alipay
        case PaymentMethodsType.ALIPAY:
          msg = 'MSG0454';
          break;
        // 銀聯
        case PaymentMethodsType.UNION_PAY:
          msg = 'MSG0651';
          break;
        // Paypal
        case PaymentMethodsType.PAYPAL:
          msg = 'MSG0590';
          break;
        // クレジットカード
        case PaymentMethodsType.CREDIT_CARD:
          msg = 'MSG0687';
          break;
        // ANA SKYコイン
        case PaymentMethodsType.ANA_SKY_COIN:
          if (isCreditCardCombination) {
            // クレジットカード併用
            msg = 'MSG0687';
          } else {
            // 全額ANA SKYコイン
            msg = 'MSG0388';
          }
          break;
        // コンビニエンスストア
        // インターネットバンキング
        default:
          msg = 'MSG0388';
          break;
      }
    }
    return msg;
  }

  /**
   * 購入発券APIエラー情報取得
   * @param apiErr APIエラーコード
   * @param selectedPaymentMethod 選択支払方法
   * @returns 購入発券APIエラー情報
   */
  public getPaymentRecordsErrorCode(
    apiErr: string,
    selectedPaymentMethod: string
  ): { errMsg: string; isRetryable: boolean } {
    let errMsg: string = '';
    let isRetryable: boolean = true;
    switch (apiErr) {
      case ErrorCodeConstants.ERROR_CODES.EBAZ000206: // クレジットカード以外の決済エラー
        if (
          selectedPaymentMethod === PaymentMethodsType.ALIPAY ||
          selectedPaymentMethod === PaymentMethodsType.UNION_PAY
        )
          errMsg = 'E0114';
        else if (selectedPaymentMethod === PaymentMethodsType.PAYPAL) errMsg = 'E0113';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000205: // クレジットカードの決済エラー
        errMsg = 'E0563';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000207: // クレジットカードの不正利用検知
        errMsg = 'E0563';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000211: // 二重受信チェックエラー
        errMsg = 'E0557';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000203: // 領収書宛名にShift-JIS以外
        errMsg = 'E0010';
        break;
      // FY25　追加START ---------------------------------------------------
      case ErrorCodeConstants.ERROR_CODES.EBAZ000533: // ビジネスきっぷANAカード番号不一致エラー
        errMsg = 'E1006';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000535: // 株主優待券情報が存在しない
        errMsg = 'E0935';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000536: // 株主優待券有効期間エラー
        errMsg = 'E0936';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000537: // 株主優待券有効期間混在エラー
        errMsg = 'E0937';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000552: // 株主優待券適用失敗エラー
        errMsg = 'E0938';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000493: // R01-P090_予約・購入完了にてAMOP決済エラー(Alipay、銀聯))
        errMsg = 'E1787';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000845: // 複数PAXの予約でSKYコインとクレカ併用のPAXとSKYコイン利用（全額コイン or クレカと併用）PAXが存在する場合にエラー
        errMsg = 'E1854';
        break;
      // FY25　追加END ------------------------------------------------------
      case ErrorCodeConstants.ERROR_CODES.EBAZ000545: // AMCのマイレージプログラムの入力が必要な運賃が選択されいるため、入力が必須
        errMsg = 'E0852';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000546: // 第一便出発日時点の年齢がスマートシニア割の年齢有効範囲内
        errMsg = 'E0854';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000547: // 第一便出発日時点の年齢がスマートの年齢有効範囲内
        errMsg = 'E0855';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000212: // 購入/発券時PNR変更発生エラー
        isRetryable = false;
        errMsg = 'E0100';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000213: // 購入時スケジュールチェンジエラー
        isRetryable = false;
        errMsg = 'E0566';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000201: // 発券期限切れエラー
        isRetryable = false;
        errMsg = 'E0564';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000202: // 購入不可PNRエラー
        isRetryable = false;
        errMsg = '';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000844: // RM登録失敗エラー
        isRetryable = false;
        errMsg = 'E1853';
        break;
      default:
        isRetryable = false;
        errMsg = '';
        break;
    }
    return { errMsg: errMsg, isRetryable: isRetryable };
  }

  /**
   * 重複削除関数
   * @param itemList
   * @param compareFn
   * @returns
   */
  public removeDuplicates<T>(itemList: T[], compareFn: (a: T, b: T) => boolean): T[] {
    return itemList.filter((item, index, self) => self.findIndex((i) => compareFn(i, item)) === index);
  }

  destroy(): void {}
}
