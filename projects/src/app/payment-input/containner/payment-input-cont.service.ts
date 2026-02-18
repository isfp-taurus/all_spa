import { Injectable } from '@angular/core';
import { apiEventAll, defaultDispPassengerName, makeShareholderCoupons } from '@common/helper';
import { MCountry } from '@common/interfaces';
import {
  CurrentCartStoreService,
  DeliveryInformationStoreService,
  FareConditionsStoreService,
  GetOrderStoreService,
} from '@common/services';
import { FareConditionsState, GetOrderState } from '@common/store';
import { SupportClass } from '@lib/components/support-class';
import { AlertMessageItem, AlertType, ApiCommonRequest, PageType } from '@lib/interfaces';
import {
  ApiErrorResponseService,
  AswMasterService,
  CommonLibService,
  ErrorsHandlerService,
  GetAwardUsersStoreService,
  PageLoadingService,
} from '@lib/services';
import { GetAwardUsersState, GetAwardUsersStore, setGetAwardUsersFromApi } from '@lib/store';
import { Store } from '@ngrx/store';
import { AmcmemberApiService } from 'src/sdk-amcmember';
import { ContactsRepresentative } from 'src/sdk-reservation';
import {
  FareConditionsRequest,
  GetOrderRequest,
  GetOrderResponseData,
  GetOrderResponseDataOrderEligibilitiesPayment,
  GetOrderResponseDataServiceSummaryHasRequested,
} from 'src/sdk-servicing';
import { screenEntryData } from '.';
import { RegisteredCardTypeEnum } from '../sub-components';
import { PreviousScreenHandoverInformation, PaymentInputScreenEntryInfo } from './payment-input-cont.state';
import { SEARCH_METHOD_SELECTION, COLLABORAITION_SITE_ID } from './payment-input-cont.state';

@Injectable({ providedIn: 'root' })
export class PaymentInputContService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _deliveryInformationStoreService: DeliveryInformationStoreService,
    private _errorsHandlerService: ErrorsHandlerService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _fareConditionsStoreService: FareConditionsStoreService,
    private _getAwardUsersApiErrorResponseService: ApiErrorResponseService,
    private _getAwardUsersStore: Store<GetAwardUsersStore>,
    private _getAwardUsersApi: AmcmemberApiService,
    private _getAwardUsersService: GetAwardUsersStoreService,
    private _getOrderStoreService: GetOrderStoreService,
    private _masterSvc: AswMasterService,
    private _pageLoadingService: PageLoadingService
  ) {
    super();
  }

  /**
   * 予約詳細画面への連携パラメータ作成
   * @param prevScreenInfo 前画面引継ぎ情報
   * @param errorId 利用不可理由を返還したエラーコード
   * @return 連携パラメータ
   */
  saveLinkageParametersInStore(prevScreenInfo: PreviousScreenHandoverInformation, errorId: string): object {
    // BookingSearchModelに従いパラメータ作成
    const queryParams = {
      previousFuncId: 'R01', // (遷移元画面機能ID)
      previousPageId: 'P080', // (遷移元画面画面ID)
      searchType: SEARCH_METHOD_SELECTION, // 検索方法選択
      cooperationNo: '', // (企業ID)
      orderId: prevScreenInfo.orderId, // 予約番号
      eticketNo: '', // (航空券番号)
      lastName: prevScreenInfo.credential.lastName, // 搭乗者名(姓)
      firstName: prevScreenInfo.credential.firstName, // 搭乗者名(名)
      amcMemberNo: '', // (AMC会員番号)
      SITE_ID: COLLABORAITION_SITE_ID, // 連携サイトID
      JSessionId: '', // (セクションID)
      aswIntErrorId: '', // (国際ASWエラーID)
      errorId: errorId, // エラーID
      warningId: '', // (ワーニングID)
      nextAction: '', // (次に必要な行うアクション)
    };
    return queryParams;
  }

  /**
   * 画面入力内容設定
   * @param countryAll マスタ国情報
   * @param pnrRepresentive pnr代表者連絡先情報
   * @return 画面入力情報
   */
  setScreenEntity(
    countryAll: MCountry[],
    isAfterStartingFrom: boolean,
    pnrInfo?: GetOrderResponseData,
    pnrRepresentive?: ContactsRepresentative
  ): PaymentInputScreenEntryInfo {
    // カート情報とPNR情報とで代表者の連絡先情報を切り替える
    let emailAddress: string;
    if (this._currentCartStoreService.CurrentCartData.data?.cartId) {
      // 操作中のカート情報がある場合、カート情報から取得
      emailAddress =
        this._currentCartStoreService.CurrentCartData.data?.plan?.contacts?.representative?.emails?.[0]?.address ?? '';
    } else {
      // 操作中のカート情報がない場合、PNR情報から取得
      emailAddress = pnrRepresentive?.emails?.[0]?.address ?? '';
    }
    const countryNumber = pnrRepresentive?.phones?.[0]?.countryPhoneExtension;
    const country = countryAll.find((item: MCountry) => item.international_tel_country_code === countryNumber);

    // 予約のみ利用可否識別子
    const availableReservationsOnly = pnrInfo?.orderEligibilities?.payment?.isOnholdEligible ?? false;
    // true(予約のみ機能利用可能)

    // 空席待ち予約識別子
    // PNR情報取得APIレスポンス.data.air.isContainedWaitlistedSegment = true(PNR情報の空席待ちセグメントが有る)の場合、true,
    // 上記以外の場合、false
    const isWaitlisted = pnrInfo?.air?.isContainedWaitlistedSegment ?? false;

    // // 株主優待券情報
    // // PNR情報取得APIレスポンス.data.air.isContainedShareholdersBenefitDiscountFare=trueの場合のみ設定
    // カテゴリ:支払情報入力、プロパティキー = ”shareholderCoupons.numberPrefix”に対する値
    const prefix = this._masterSvc.getMPropertyByKey('paymentInformationInput', 'shareholderCoupons.numberPrefix');
    const shareholderCoupons = pnrInfo?.air?.isContainedShareholdersBenefitDiscountFare
      ? makeShareholderCoupons(pnrInfo?.air?.bounds, pnrInfo?.travelers, prefix)
      : [];

    return {
      ...screenEntryData(),
      availableReservationsOnly,
      isWaitlisted,
      isShowShareholderCouponsArea: (shareholderCoupons?.flatMap((bound) => bound.flights).length ?? 0) > 0,
      shareholderCoupons,
      creditCardInformation: {
        // クレジットカード情報.選択中のクレジットカード
        selectedCreditCard: RegisteredCardTypeEnum.NewCard,
        // クレジットカード情報.カード番号
        cardNumber: '',
        // クレジットカード情報.有効期限
        expiryDate: '',
        // クレジットカード情報.カード名義人
        holderName: '',
        // クレジットカード情報.UATPカード選択識別子
        isUatpCard: false,
        // クレジットカード情報.CVV
        securityCode: '',
        // クレジットカード情報.カード名義
        cardHolder: '',
        // カート情報とPNR情報とで代表者の連絡先情報を切り替える
        // クレジットカード情報.名義人メールアドレス
        mailAddress: emailAddress,
        // クレジットカード情報. 名義人メールアドレス確認
        confirmmailAddress: emailAddress,
        // クレジットカード情報.電話番号国
        phoneCountry: country?.country_2letter_code ?? '',
        // クレジットカード情報.電話番号国番号
        countryNumber: countryNumber ?? '',
        // クレジットカード情報.電話番号
        phoneNumber: pnrRepresentive?.phones?.[0]?.number ?? '',
        // 領収証発行名義人
        issueReceipt: defaultDispPassengerName({
          ...(pnrInfo?.travelers?.[0]?.names?.[0] ?? {}),
          title: undefined,
        }),
      },
    };
  }

  /**
   * Ancillaryサービスの申込状況
   * @param requestInfo pnr申し込み状況
   * @return true: 申込有 / false:申込無
   */
  getAncillaryServiceStatus(requestInfo: GetOrderResponseDataServiceSummaryHasRequested | undefined): boolean {
    if (
      requestInfo?.firstBaggage || // 事前追加手荷物
      requestInfo?.chargeableLounge || // 国際線有料ラウンジ
      requestInfo?.chargeableMeal || // 有料機内食
      requestInfo?.chargeableSeat // 有料事前座席指定
    ) {
      return true;
    }
    return false;
  }

  /**
   * 支払情報入力機能利用不可理由取得
   * @param reasons 支払情報入力機能利用不可理由（PNR情報）
   * @returns エラーコード
   */
  orderEligibilitiesToErrorId(
    reasons: Array<GetOrderResponseDataOrderEligibilitiesPayment.NonEligibilityReasonsEnum> | undefined
  ): string {
    const code = GetOrderResponseDataOrderEligibilitiesPayment.NonEligibilityReasonsEnum;
    if (
      reasons?.some(
        (value) =>
          value === code.NotNhPnr || // 直営PNRでない
          value === code.CallCenterCreated || // PNRオーナーオフィスコードが、オフィスマスタに登録されているWebオフィスではない
          value === code.NdcPnr || // NDC PNR
          value === code.NeedMedicalSupport || // 日本国内単独旅程かつ操作オフィスのPOSがアメリカ以外で、SSR MEDA、STCR、DPNAのいずれかが存在（医療系サポートが必要）
          value === code.HasInfantAndNeedSupport || // 日本国内単独旅程かつ操作オフィスのPOSがアメリカ以外で、SSR WCHC、SSR CKIN EXMO、SK EXMOのいずれかが存在し、かつ席あり、席なしを問わず幼児が存在する
          value === code.SegmentNotConfirmed || // セグメントステータスが確定ステータス(設定ファイルにて管理)以外である便が含まれる
          value === code.HasOpenSegment || // OPEN便が含まれる
          value === code.OfflineRemark // RMエレメントにWEB発券不可を示す所定の文字列が存在する
      )
    ) {
      return 'E0550'; // 購入発券ができない旨
    }
    if (reasons?.some((value) => value === code.PassedTicketIssuanceDeadline)) {
      // 発券期限切れ
      return 'E0564'; // 発券期限切れの旨
    }
    return ''; // その他の利用不可理由
  }

  /**
   * 前画面引継ぎ情報エラーの処理
   */
  previousScreenError() {
    const errInfo = this._deliveryInformationStoreService.deliveryInformationData.passToPayment?.errInfo;
    // 前画面引継情報.エラー情報がある場合、以下の処理を行う
    if (errInfo && errInfo?.length > 0) {
      errInfo.forEach((info) => {
        // 継続可能エラー
        this._errorsHandlerService.setRetryableError(PageType.PAGE, info);
      });
    }
    const warningInfo = this._deliveryInformationStoreService.deliveryInformationData.passToPayment?.warningInfo;
    if (warningInfo && warningInfo?.length > 0) {
      warningInfo.forEach((info) => {
        const alertMessageData: AlertMessageItem = {
          contentHtml: `m_error_message-${info.errorMsgId}`,
          isCloseEnable: true,
          alertType: AlertType.WARNING,
          errorMessageId: `${info.errorMsgId}`,
        };
        // ワーニング情報
        this._common.alertMessageStoreService.setAlertWarningMessage(alertMessageData);
      });
    }
  }

  /**
   * PNR情報取得APIのリクエストパラメータ作成
   * @param prevScreenInfo 前画面引継ぎ情報
   * @returns PNR情報取得APIリクエストパラメータ
   */
  serviceCommonInformationAcuquisition(prevScreenInfo: PreviousScreenHandoverInformation) {
    // 8.操作中のカートが存在しない場合、サービス共通情報を前画面の引継ぎ情報とする
    const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId;
    if (cartId) {
      // 操作中のカート情報がある場合、PNR情報取得APIのリクエストパラメータ作成
      return {
        orderId: prevScreenInfo.orderId, // 前画面引継ぎ情報
        credential: {
          firstName: prevScreenInfo.credential.firstName, // 前画面引継ぎ情報.代表者名
          lastName: prevScreenInfo.credential.lastName, // 前画面引継ぎ情報.代表者姓
        },
        mask: false,
        cartId: cartId,
        getServiceCatalogue: false,
        skipCheckTasks: true, //滞在先情報取得の処理をスキップ
        skipWifiInfo: true, //WIFI取得の処理をスキップ
        skipOperationInfo: true, //発着APIの処理をスキップ
        skipCprInfo: true, //CPR情報取得の処理をスキップ
        skipServicingPapi: false, //内部処理(PAPI)をスキップ
      };
    } else {
      // 操作中のカート情報がない場合、サービス共通情報取得処理(オーダID、お客様姓名)
      return {
        orderId: prevScreenInfo.orderId, // 前画面引継ぎ情報
        credential: {
          firstName: prevScreenInfo.credential.firstName, // 前画面引継ぎ情報.代表者名
          lastName: prevScreenInfo.credential.lastName, // 前画面引継ぎ情報.代表者姓
        },
        mask: false,
        getServiceCatalogue: false,
        skipCheckTasks: true, //滞在先情報取得の処理をスキップ
        skipWifiInfo: true, //WIFI取得の処理をスキップ
        skipOperationInfo: true, //発着APIの処理をスキップ
        skipCprInfo: true, //CPR情報取得の処理をスキップ
        skipServicingPapi: false, //内部処理(PAPI)をスキップ
      };
    }
  }

  /**
   * 運賃・手荷物ルール取得API実行のためのパラメータ作成
   * @param prevScreenInfo 前画面引継ぎ情報
   * @return 運賃・手荷物ルールAPIリクエストパラメータ
   */
  public generateFareConditionApiParam(prevScreenInfo: PreviousScreenHandoverInformation): FareConditionsRequest {
    const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId;
    const params = {
      orderId: prevScreenInfo.orderId, // 前画面引継ぎ情報
      credential: {
        firstName: prevScreenInfo.credential.firstName, // 前画面引継ぎ情報.代表者名
        lastName: prevScreenInfo.credential.lastName, // 前画面引継ぎ情報.代表者姓
      },
      commonIgnoreErrorFlg: true, // エラーハンドリング回避
    } as FareConditionsRequest;
    if (cartId) {
      params.cartId = cartId;
    }
    return params;
  }

  /**
   * 運賃・手荷物ルール取得API呼び出し
   * @param fareConditionsRequestParam リクエストパラメータ
   * @param successEvent 成功時処理
   * @param errorEvent 失敗時処理
   */
  public invokeGetFareConditionsApi(
    fareConditionsRequestParam: FareConditionsRequest,
    successEvent?: (response: FareConditionsState) => void,
    errorEvent?: (error: FareConditionsState) => void
  ) {
    apiEventAll(
      () => {
        this._fareConditionsStoreService.setFareConditionsFromApi(fareConditionsRequestParam);
      },
      this._fareConditionsStoreService.getFareConditions$(),
      (response) => {
        if (successEvent) successEvent(response);
      },
      (error) => {
        if (errorEvent) errorEvent(error);
      }
    );
  }

  /**
   * PNR情報取得API呼び出し
   * @param getOrderRequestParam リクエストパラメータ
   * @param successEvent 成功時処理
   * @param errorEvent 失敗時処理
   */
  public invokeGetOrderApi(
    getOrderRequestParam: GetOrderRequest,
    successEvent: (response: GetOrderState) => void,
    errorEvent: (error: GetOrderState) => void
  ) {
    apiEventAll(
      () => {
        this._getOrderStoreService.setGetOrderFromApi(getOrderRequestParam);
      },
      this._getOrderStoreService.getGetOrderObservable(),
      (response) => {
        successEvent(response);
      },
      (error) => {
        errorEvent(error);
      }
    );
  }

  /**
   * 支払情報入力で使用するキャッシュ情報取得
   * @param lang 画面言語
   * @returns 支払情報入力で使用するキャッシュ情報
   */
  public getPaymentInformationRequestMasterKey(lang: string, isWellnetPaymentEligible: boolean) {
    let masterKeys = [];
    const posCode = this._common.aswContextStoreService.aswContextData.posCountryCode;

    masterKeys.push({
      key: 'PaymentInformation_All',
      fileName: 'PaymentInformation_All',
    });
    masterKeys.push({
      key: 'Country_All',
      fileName: 'Country_All',
    });
    masterKeys.push({
      key: 'office_all',
      fileName: 'Office_All',
    });
    masterKeys.push({
      key: 'ListData_All',
      fileName: 'ListData_All',
    });
    masterKeys.push({
      key: 'Country_WithPosCountryByContactTelNumberCountryFlg',
      fileName: `Country_WithPosCountryByContactTelNumberCountryFlg_${lang}`,
    });
    masterKeys.push({
      key: 'Country_CountryI18n_All',
      fileName: `Country_CountryI18n_All_${lang}`,
    });
    if (isWellnetPaymentEligible) {
      masterKeys.push({
        key: `M_Bank_Wellnet`,
        fileName: `M_Bank_Wellnet_${lang}`,
      });
    }

    return masterKeys;
  }

  destroy(): void {}
}
