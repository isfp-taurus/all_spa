import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { SupportPageComponent } from '@lib/components/support-class';
import {
  AswMasterService,
  AswServiceStoreService,
  CommonLibService,
  ErrorsHandlerService,
  GetAwardUsersStoreService,
  PageInitService,
  PageLoadingService,
} from '@lib/services';
import { GetOrderResponseData, Type1 } from 'src/sdk-servicing';
import { ErrorType, MOffice, PageType } from '@lib/interfaces';
import {
  AnaSkyCoinInfo,
  PaymentInputScreenEntryInfo,
  screenEntryData,
  PreviousScreenHandoverInformation,
  PaymentInputMasterData,
  PaymentInputInitMOffice,
  initPreviousScreenHandoverInformation,
  dynamicSubject,
} from './payment-input-cont.state';
import {
  CurrentCartStoreService,
  DeliveryInformationStoreService,
  GetOrderStoreService,
  GetUnavailablePaymentByOfficeCodeService,
  PaymentInputStoreService,
  SearchFlightStoreService,
  OrdersReservationAvailabilityStoreService,
} from '@common/services';
import { AswCommonState, GetAwardUsersState } from '@lib/store';
import { isPC, isSP, isTB } from '@lib/helpers';
import { BehaviorSubject, filter, Subscription, take } from 'rxjs';
import { I18N_CONFIG } from '@conf/i18n.config';
import { LinkUrlPipe, StaticMsgPipe } from '@lib/pipes';
import {
  apiEventAll,
  defaultDispPassengerName,
  fixedArrayCache,
  getPhoneCountryList,
  submitNavigate,
  defaultApiErrorEvent,
} from '@common/helper';
import { CountryCodeNameType, MCountry, MListData, ShareholderCouponsType } from '@common/interfaces';
import {
  PaymentInputPresData,
  initPaymentInputPresData,
  PaymentInputPresParts,
  initPaymentInputPresParts,
} from '../presenter/payment-input-pres.state';
import { environment } from '@env/environment';
import { PaymentInputPresComponent } from '../presenter/payment-input-pres.component';
import { PaymentMethodsCode, PaymentMethodsType } from '@common/interfaces/common/payment-methods';
import { GetOrderState } from '@common/store';
import { PaymentInputContService } from './payment-input-cont.service';
import { MBankWellnet } from '@common/interfaces/common/m_bank_wellnet';
import { RegisteredCardTypeEnum } from '../sub-components';
import { MPaymentInformation } from '@common/interfaces/master/m_payment_information';
import { RoutesResRoutes } from '@conf/routes.config';
import { Router } from '@angular/router';
import { ReservationAvailabilityRequest } from 'src/sdk-member';
import { GetCreditPanInformationResponseData } from 'src/sdk-credit';

// 予約詳細画面へ連携する検索方法選択
const SEARCH_METHOD_SELECTION = 'order'; // 予約番号で検索
// 予約詳細画面へ連携する連携サイトID
const COLLABORAITION_SITE_ID = 'ALL_APP'; // ASW内の他アプリからの遷移
// 前画面引継ぎ情報
const prevScreenInfo: PreviousScreenHandoverInformation = {
  orderId: '',
  credential: {
    firstName: '',
    lastName: '',
  },
};
import { DOCUMENT } from '@angular/common';
import { GetAwardUsersResponseDataAwardUsersInner } from 'src/sdk-amcmember/model/getAwardUsersResponseDataAwardUsersInner';
import { PaymentInputPresTicketingService } from '../presenter/payment-input-pres-ticketing.service';

@Component({
  selector: 'asw-payment-input-cont',
  templateUrl: './payment-input-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [Title],
})
export class PaymentInputContComponent extends SupportPageComponent {
  // 初期化処理自動完了をオフにする
  override autoInitEnd = false;
  // 初期表示可否判定
  public isReadyToShow: boolean = false;
  // PNR情報
  public pnrInfo: GetOrderResponseData | undefined = {};

  public awardUsersInfo: GetAwardUsersResponseDataAwardUsersInner[] | undefined = [];

  /** 1. 遷移元画面情報 */
  private _previousPage: string = '';
  /** 2. 画面情報.機能ID (新規予約) */
  public functionId: string = 'R01';
  /** 2. 画面情報.ページID (支払情報入力) */
  public pageId: string = 'P080';
  /** 2. 画面情報.サブ機能ID */
  private _subFunctionId: string = '';
  /** 2. 画面情報.サブページID */
  private _subPageId: string = '';
  /** 2. 画面情報.ヘッダログイン可能フラグ */
  private _isHeaderLogin: boolean = false; // 非表示
  /** 2. 画面情報.AAMプロモーションコード */
  private _appliedAamDiscountCode: string = '';
  /** 4. クレジットカード決済対象判定 */
  public isCreditCardPayment: boolean = false; // 決済非対象
  /** 5. 画面初期表示判定 */
  private _isInitialDisplay: boolean = true; // 初期表示

  /** Ancillaryサービス申し込み状況 (true:申込有 / false:申込無) */
  public isAncillaryService: boolean = false;
  /** ウェルネット決済可能銀行リスト */
  public availableBankList: Array<MBankWellnet> = [];
  /** ウェルネット銀行リスト */
  public wellnetBankList: Array<MBankWellnet> = [];
  /**国.国コード(2レター) 国(国際化).国名称*/
  public phoneCountryInfoList: Array<CountryCodeNameType> = [];
  public phoneCountryInfoListMaster: Array<CountryCodeNameType> = [];
  /** インターネットバンキング */
  public selectedBank: string = '';
  /** プロモーションコード適用判定 (true:適用可 / false:適用不可) */
  public isApplicableDiscountCode: boolean = false;
  /** 適用済プロモーション種別 ('CAT25' / 'AAM') */
  public appliedDiscountType: string = '';
  /** ANA SKYコイン利用額の合計 */
  public totalUseCoin: number = 0;
  /** 予約のみ識別子 */
  public isReservationOnly: boolean = false;
  /** 予約のみ利用可能識別子 */
  public availableReservationsOnly: boolean = false;
  /** KMF表示識別子 */
  public isDisplayKeepMyFare: boolean = false;
  /** DSC以降開始後識別子 */
  public isAfterStartingFrom: boolean = false;
  /** 株主優待券情報 */
  public shareholderCoupons?: Array<ShareholderCouponsType>;
  /** 支払方法選択エリア表示するかどうか */
  public isDisplayPayMethodSelectionArea: boolean = false;
  /** 画面情報 */
  public screenEntry: PaymentInputScreenEntryInfo = screenEntryData();
  /** 支払い情報利用可否判定マップ */
  public paymentMethod = new Map([
    ['' + PaymentMethodsType.ALIPAY, false], // Alipay
    ['' + PaymentMethodsType.UNION_PAY, false], // 銀聯
    ['' + PaymentMethodsType.CREDIT_CARD, false], // クレジットカード
    ['' + PaymentMethodsType.ANA_SKY_COIN, false], // ANA SKYコイン
    ['' + PaymentMethodsType.PAYPAL, false], // PayPal
    ['' + PaymentMethodsType.CONVENIENCE_STORE, false], // コンビニエンスストア
    ['' + PaymentMethodsType.INTERNET_BANKING, false], // インターネットバンキング
    ['' + PaymentMethodsType.KEEP_MY_FARE, false], // Keep My Fare
    ['' + PaymentMethodsType.PAY_EASY, false], // Pay-easy
    ['' + PaymentMethodsType.RESERVATION_ONLY, false], // 予約のみ利用可能
  ]);
  /** デバイスを除く支払い情報利用可否判定マップ */
  private _availablePaymentMethodWithoutDevice = new Map();
  /** 予約基本情報レスポンス支払方法と銀行コード対応関係マップ */
  private _basicReservationInfoToBankCodeMap = new Map<string, string>([
    ['060', 'FU'],
    ['061', 'SA'],
    ['063', 'SW'],
    ['069', 'YB'],
  ]);

  public anaSkyCoinInfo: Array<AnaSkyCoinInfo> = [];
  /** 支払方法選択表示判定 */
  public isDisplayPaymentMethodSelection = false;
  /** SP支払方法変更モード判定 */
  public isChangePaymentMethod = true;
  /** SPクレジットカード変更モード判定 */
  public isChangeCreditCard = true;

  private _paymentInputMasterData: PaymentInputMasterData = {
    paymentInformations: [],
    countries: [],
    offices: [],
    banks: [],
    listData: [],
    posCountry: {},
    posCountryJp: [],
  };

  private _paymentInputInfo = { ...this._paymentInputStoreService.paymentInputData };
  public selectedPaymentMethod: string = '';

  // 操作オフィス情報
  public currentOfficeInfo: MOffice = PaymentInputInitMOffice();

  // 前画面引継ぎ情報
  prevScreenInfo: PreviousScreenHandoverInformation = initPreviousScreenHandoverInformation();

  // コンポーネント間受け渡しデータ
  public data: PaymentInputPresData = initPaymentInputPresData();
  public parts: PaymentInputPresParts = initPaymentInputPresParts();

  public isPaying = false;
  public _isPayingSubscribe: Subscription = new Subscription();

  /**
   * 初期化時、運賃・手荷物ルール取得API完了の制御
   */
  private _fareConditionsInit$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * ngOnDestroyにunsubscribeを実行
   */
  private _subscriptions: Subscription = new Subscription();

  /** 支払不可情報リスト */
  private _unavailablePaymentList: string[] = [];

  /* コンストラクタ */
  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _common: CommonLibService,
    private _pageInitService: PageInitService,
    private _title: Title,
    private _currentCartStoreService: CurrentCartStoreService,
    private _getOrderStoreService: GetOrderStoreService,
    private _getAwardUsersService: GetAwardUsersStoreService,
    private _errorsHandlerService: ErrorsHandlerService,
    private _aswServiceService: AswServiceStoreService,
    private _paymentInputStoreService: PaymentInputStoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _aswMasterService: AswMasterService,
    private _staticMsg: StaticMsgPipe,
    private _contService: PaymentInputContService,
    private _masterSvc: AswMasterService,
    private _linkUrl: LinkUrlPipe,
    private _deliveryInfoStoreService: DeliveryInformationStoreService,
    private _searchFlightStoreService: SearchFlightStoreService,
    private _paymentInputPresTicketingService: PaymentInputPresTicketingService,
    private _pageLoadingService: PageLoadingService,
    private _router: Router,
    private _getUnavailablePaymentByOfficeCodeService: GetUnavailablePaymentByOfficeCodeService,
    private _ordersReservationAvailabilityStoreService: OrdersReservationAvailabilityStoreService
  ) {
    super(_common, _pageInitService);
    // 前画面情報の取得
    const prevPageId: string = this._common.aswCommonStoreService.aswCommonData.pageId ?? '';
    const prevFunctionId: string = this._common.aswCommonStoreService.aswCommonData.functionId ?? '';
    this._previousPage = prevFunctionId + prevPageId;
    // サブヘッダに渡すため、当画面用storeに格納
    this._paymentInputInfo.previousPage = this._previousPage;
    this._paymentInputStoreService.setPaymentInput(this._paymentInputInfo);
    // サブヘッダに反映するためmarkForCheck
    this._changeDetectorRef.markForCheck();
    // AMOP支払中状態を取得する
    this._isPayingSubscribe = this._paymentInputPresTicketingService.getPayingStatus$().subscribe((status: boolean) => {
      this.isPaying = status;
      this._changeDetectorRef.markForCheck();
    });

    // タブバーに画面タイトルを設定する
    this.forkJoinService(
      'paymentInputCont_setTitle',
      [this._staticMsg.get('label.paymentInformation.title'), this._staticMsg.get('label.aswPageTitle')],
      ([str1, str2]) => {
        this.deleteSubscription('paymentInputCont_setTitle');
        if (str1 && str2) {
          this._title.setTitle(str1 + str2);
        }
      }
    );
    // 当画面の情報を設定
    const commonStateParams: AswCommonState = {
      functionId: this.functionId,
      pageId: this.pageId,
      subFunctionId: this._subFunctionId,
      subPageId: this._subPageId,
      isEnabledLogin: this._isHeaderLogin,
    };
    this._common.aswCommonStoreService.setAswCommon(commonStateParams);
  }

  // PresenterのコンポーネントのViewChild
  @ViewChild(PaymentInputPresComponent) presenterComponent!: PaymentInputPresComponent;

  reload(): void {}

  /**
   * 動的文言表示Storeから情報取得
   */
  dynamicOn() {
    const isSubPage = true;

    this.subscribeService(
      'paymentInputCont_setDynamicMessageId',
      this._common.dynamicContentService.getDynamicContent$(isSubPage),
      (jsPath) => {
        this.deleteSubscription('paymentInputCont_setDynamicMessageId');
      }
    );
  }

  /**
   * 初期表示処理
   */
  init(): void {
    this.dynamicOn();
    // 8.操作中カート情報が存在しない場合、サービス共通情報を前画面の引継情報として保持する。
    const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId;
    if (cartId) {
      this.prevScreenInfo.orderId = this._deliveryInfoStoreService.deliveryInformationData.passToPayment?.orderId ?? '';
      this.prevScreenInfo.credential.firstName =
        this._deliveryInfoStoreService.deliveryInformationData.passToPayment?.credential?.firstName ?? '';
      this.prevScreenInfo.credential.lastName =
        this._deliveryInfoStoreService.deliveryInformationData.passToPayment?.credential?.lastName ?? '';
      // 運賃・手荷物ルール取得APIを実行
      this.fareConditions(() => this._fareConditionsInit$.next(true), true);
      this.executeGetOrderApi();
    } else {
      this._aswServiceService
        .getAswService$()
        .pipe(take(1))
        .subscribe(({ orderId, firstName, lastName }) => {
          this.prevScreenInfo.orderId = orderId ?? '';
          this.prevScreenInfo.credential.firstName = firstName ?? '';
          this.prevScreenInfo.credential.lastName = lastName ?? '';
          // 運賃・手荷物ルール取得APIを実行
          this.fareConditions(() => this._fareConditionsInit$.next(true), true);
          this.executeGetOrderApi();
        });
    }
    // サブヘッダに渡すため、当画面用storeに格納
    this._paymentInputInfo.previousScreenInfo = this.prevScreenInfo;
    this._paymentInputStoreService.setPaymentInput(this._paymentInputInfo);
  }

  /**
   * 初期表示処理内でのPNR情報取得処理実行
   */
  executeGetOrderApi() {
    // 9.PNR情報取得APIの実行
    this._contService.invokeGetOrderApi(
      // PNR情報取得APIのリクエストパラメータ作成
      this._contService.serviceCommonInformationAcuquisition(this.prevScreenInfo),
      (response) => {
        // PNR情報取得APIレスポンスを保存
        this.pnrInfo = response.data;
        // 初期表示処理実行
        this.initialDisplayProcessing();
      },
      (error) => {
        // 10.APIレスポンスが不合格の場合継続不可能エラー - businessLogic）
        this._errorsHandlerService.setNotRetryableError({
          errorType: ErrorType.BUSINESS_LOGIC, // ビジネスロジックエラー
          errorMsgId: 'E0096', // E0096: PNR取得失敗
          apiErrorCode: this._common.apiError?.errors?.[0]?.code, // APIエラーレスポンス情報
        });
        this.showInitialContents();
      }
    );
  }

  destroy(): void {
    this._isPayingSubscribe.unsubscribe();
    this._subscriptions.unsubscribe();
  }

  /**
   * 正常にPNR情報が取得できた後の初期表示処理
   * @returns 戻り値なし
   */
  initialDisplayProcessing() {
    // 特典の場合
    const isAwardBooking = this.pnrInfo?.orderType?.isAwardBooking ?? false;
    if (isAwardBooking) {
      // 予約可否判断APIストアのデータ存在チェック
      this.checkStoreData();
    }
    // 11.利用不可判定
    if (this.pnrInfo?.orderEligibilities?.payment?.isEligible === false) {
      // 支払情報入力機能利用不可の場合 (利用不可理由からエラーIDを取得)
      const errorId = this._contService.orderEligibilitiesToErrorId(
        this.pnrInfo?.orderEligibilities?.payment?.nonEligibilityReasons
      );
      // 各画面への連携パラメータを作成
      const previousPage = this._paymentInputStoreService.paymentInputData.previousPage ?? '';
      switch (previousPage) {
        case 'R01P040': // プラン確認
        case 'R01P070': // シートマップ
        case 'R01P071': // 座席属性指定
          // PNR情報削除
          this._getOrderStoreService.resetGetOrder();
          // プラン確認画面への受け渡し情報の更新
          this._deliveryInfoStoreService.updateDeliveryInformation({
            planReviewInformation: {
              errInfo: [{ errorMsgId: errorId }],
            },
          });
          this._router.navigateByUrl(RoutesResRoutes.PLAN_REVIEW);
          break;
        default: //システムエラー画面
          this._common.errorsHandlerService.setNotRetryableError({
            errorType: ErrorType.SYSTEM,
            apiErrorCode: errorId,
          });
          break;
      }
      return;
    }

    // カテゴリ：UIUX移行関連からプロパティキー = ”uiuxs2.transitionDate.domesticDcs”に対する値を取得し、DCS移行開始日付とする。
    const transitionStartDate = this._masterSvc.getMPropertyByKey('migration', 'uiuxs2.transitionDate.domesticDcs');
    const PnrDate = this.pnrInfo?.air?.bounds?.[0]?.originDepartureDateTime ?? '';
    if (!PnrDate) throw new Error('PNR originDepartureDateTime is invalid.');
    // Unix Ｄateを取得する関数
    const getUnixTime = (d: Date) => Math.floor(d.getTime() / 1000);
    // DCS移行開始日付
    const transitionStartDateUnix = getUnixTime(new Date(transitionStartDate));
    // PNR DateTime
    const pnrDateUnix = getUnixTime(new Date(PnrDate));
    // DCS移行開始日付 ≦ PNR 情報取得レスポンス.data.air.bounds[0].originDepartureDateTimeの場合、
    // DSC以降開始後識別子としてtrue、それ以外はfalseを保持する。
    this.isAfterStartingFrom = transitionStartDateUnix <= pnrDateUnix;

    // 14-16.ASWDB(マスタ)取得処理
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    const isWellnetPaymentEligible = this.pnrInfo?.orderEligibilities?.payment?.isWellnetPaymentEligible ?? false;
    this.subscribeService(
      'paymentInputCont_getMasterDataAll',
      this._aswMasterService.load(
        this._contService.getPaymentInformationRequestMasterKey(lang, isWellnetPaymentEligible),
        true
      ),
      (data) => {
        this.deleteSubscription('paymentInputCont_getMasterDataAll');
        this._paymentInputMasterData.paymentInformations = fixedArrayCache(data[0]);
        this._paymentInputMasterData.countries = fixedArrayCache(data[1]);
        this._paymentInputMasterData.offices = fixedArrayCache(data[2]);
        const posCode = this._common.aswContextStoreService.aswContextData.posCountryCode;
        this._paymentInputMasterData.listData = fixedArrayCache(data[3]);
        this._paymentInputMasterData.posCountry = data[4];
        this._paymentInputMasterData.posCountryJp = data[5];
        if (isWellnetPaymentEligible) {
          this._paymentInputMasterData.banks = fixedArrayCache(data[6]);
        }
        const _phoneCountryInfoListMaster = getPhoneCountryList(
          this._paymentInputMasterData.posCountry,
          this._paymentInputMasterData.posCountryJp,
          posCode
        );
        _phoneCountryInfoListMaster
          .filter((pos) => pos.isTranslate)
          .forEach((pos) => (pos.countryName = this._staticMsg.transform(pos.countryName)));
        this.phoneCountryInfoListMaster = _phoneCountryInfoListMaster;

        //国IPに対して、言語に合わせて、国番号に合わせて表示します。
        this.phoneCountryInfoList = this.phoneCountryInfoListMaster;
        //※アメリカ・カナダについては、ASWDB(マスタ)で管理している電話番号国用の名称で表示する。
        this.phoneCountryInfoList = this.phoneCountryInfoList.map((item) => ({
          ...item,
          countryCode: item.countryCode ?? '-',
        }));

        // 支払方法利用可否リスト取得
        this._unavailablePaymentList =
          this._getUnavailablePaymentByOfficeCodeService.getUnavailablePaymentByOfficeCode();

        // 画面情報の初期設定
        this.screenInformationSetting();
      }
    );
  }

  /**
   * 画面情報の初期設定
   * @returns 戻り値なし
   */
  screenInformationSetting() {
    // 操作オフィス情報取得
    const operationOfficeCode = this._common.aswContextStoreService.aswContextData.pointOfSaleId;
    this.currentOfficeInfo =
      this._paymentInputMasterData.offices.find((moffice: MOffice) => moffice.office_code === operationOfficeCode) ??
      this.currentOfficeInfo;

    // 17-18.画面入力内容設定
    this.screenEntry = this._contService.setScreenEntity(
      this._paymentInputMasterData.countries,
      this.isAfterStartingFrom,
      this.pnrInfo,
      this.pnrInfo?.contacts?.representative
    );
    // 5.支払方法利用可否リスト取得
    this.getAvailabilityPaymentMethod();
    // 6.会員情報の取得
    // 6.1 ログイン状態がリアルログインだった場合、予約基本情報取得APIを実行
    if (!this._common.isNotLogin()) {
      this.setDynamicInfo();
      this.getMemberInformation();
      this.selectPaymentMethod();
      return;
    }
    // 9.支払方法選択表示判定
    this.paymentMethodDisplay();
    // 10.選択中の支払方法設定
    this.setSelectedPaymentMethod();
    // 11.支払方法がクレジットカード
    if (this.screenEntry.selectedPaymentMethod === PaymentMethodsType.CREDIT_CARD) {
      this.isCreditCardPayment = true; // クレジットカード決済対象
      this.isChangeCreditCard = true; // SPクレジットカード変更モード
    }
    // 画面初期表示判定
    this._isInitialDisplay = false;

    // 動的文言
    this.setDynamicInfo();

    // 前画面引継情報.エラー情報がある場合の処理
    this._contService.previousScreenError();
    // 17-18.画面入力内容設定 (未ログイン)
    this.setPartsInfo();
    this._subscriptions.add(
      this._fareConditionsInit$
        .pipe(
          filter((data): boolean => data),
          take(1)
        )
        .subscribe(() => {
          this._pageInitService.endInit(dynamicSubject.asObservable());
        })
    );
    this._changeDetectorRef.markForCheck();
  }

  setPartsInfo() {
    // 17-18.画面入力内容設定 (未ログイン)
    this.parts.creditCardParts.cardHolderInfoParts = {
      countryAll: this._paymentInputMasterData.countries,
      email: this.screenEntry.creditCardInformation.mailAddress,
      countryCode: this.screenEntry.creditCardInformation.phoneCountry,
      phoneNumber: this.screenEntry.creditCardInformation.phoneNumber,
    };
    this.parts.creditCardParts.creditCardReceiptParts = {
      issueReceipt: this.screenEntry.creditCardInformation.issueReceipt,
    };
    this.parts = {
      ...this.parts,
      paymentMethodsParts: {
        selectedPaymentMethod: this.screenEntry.selectedPaymentMethod,
      },
      paymentAmountParts: {
        appliedDiscountType: this.appliedDiscountType,
        appliedAamDiscountCode: this._appliedAamDiscountCode,
      },
    };
  }

  /** 動的文言設定 */
  setDynamicInfo(): void {
    const searchFlightCondition = this._searchFlightStoreService.getData();
    dynamicSubject.next({
      getOrderReply: { data: this.pnrInfo },
      fareConditionsReply: undefined,
      pageContext: {
        availablePaymentMethods: Array.from(this.paymentMethod)
          .filter((k) => k[1] === true)
          .map((k) => {
            return k[0];
          }),
        currentPaymentMethod: this.selectedPaymentMethod,
        flightCondition: { fare: { isMixedCabin: searchFlightCondition?.fare.isMixedCabin ? true : false } },
        hasSearchCriteria: searchFlightCondition ? true : false,
        isKeepMyFare: false,
      },
    });
  }

  /**
   *  プロモーションコード適用判定 (true:適用可 / false:適用不可)
   */
  getDiscountCodeApplicabilityStatus() {
    const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId;
    // ユーザ共通.操作オフィスコード
    const operationOfficeCode = this._common.aswContextStoreService.aswContextData.pointOfSaleId;
    // ユーザ共通.操作オフィスコード=オフィス.オフィスコードであるオフィスのプロモーション利用可能判定=true
    this.currentOfficeInfo =
      this._paymentInputMasterData.offices.find((moffice: MOffice) => moffice.office_code === operationOfficeCode) ??
      this.currentOfficeInfo;

    // プロモーションコード適用済判定
    this.appliedDiscountType = ''; // 適用済みプロモーション種別なし
    this.isApplicableDiscountCode = false; // AAMプロモーションコード適用不可
    if (this.pnrInfo?.prices?.totalPrices?.discount?.cat25DiscountName) {
      this.appliedDiscountType = 'CAT25'; // CAT25プロモーションコード適用済
    } else if (this.pnrInfo?.prices?.totalPrices?.discount?.aamDiscountCode) {
      this.appliedDiscountType = 'AAM'; // AAMプロモーションコード適用済
      this._appliedAamDiscountCode = this.pnrInfo?.prices?.totalPrices?.discount?.aamDiscountCode ?? '';
      this.parts = {
        ...this.parts,
        paymentAmountParts: {
          appliedDiscountType: this.appliedDiscountType,
          appliedAamDiscountCode: this._appliedAamDiscountCode,
        },
      };
    }

    if (
      // 適用済プロモーション種別=(nullまたは””(空白))
      !this.appliedDiscountType &&
      // 操作中カート情報情報が存在する、または(DCS移行開始後識別子=true、かつPNR情報取得レスポンス.data.air.tripType=”domestic”(日本国内単独旅程))
      (cartId || (this.isAfterStartingFrom && this.pnrInfo?.air?.tripType === 'domestic')) &&
      // ユーザ共通.操作オフィスコード=オフィス.オフィスコードであるオフィスのプロモーション利用可能判定=true
      this.currentOfficeInfo.promotion_available_flag
    ) {
      // AAMプロモーションコード適用可能判定をtrueに設定する
      this.isApplicableDiscountCode = true;
    }
    // プロモーションコード変更判定としてfalse(変更なし)を設定
    this._paymentInputInfo.isChangePromotionCode = false;
  }

  /**
   * 支払方法利用可否判定
   */
  getAvailabilityPaymentMethod() {
    //空席待ち予約識別子=trueの場合、支払方法毎利用可否設定処理を終了する
    if (this.screenEntry.isWaitlisted === true) {
      return;
    }

    // デバイスごとの利用可否判定
    const isAvailabe = (kind: string) => {
      const paymentInfo = this._paymentInputMasterData.paymentInformations.find(
        (info: MPaymentInformation) => info.payment_method === kind
      );
      const availableWithoutDevice = this._availablePaymentMethodWithoutDevice.get(kind) ?? true;

      if (paymentInfo) {
        if (isPC() && paymentInfo.available_pc) {
          this.paymentMethod.set(kind, true && availableWithoutDevice);
        } else if (isSP() && paymentInfo.available_sp) {
          this.paymentMethod.set(kind, true && availableWithoutDevice);
        } else if (isTB() && paymentInfo.available_tab) {
          this.paymentMethod.set(kind, true && availableWithoutDevice);
        } else {
          this.paymentMethod.set(kind, false);
        }
      }
    };
    isAvailabe(PaymentMethodsType.CREDIT_CARD); // クレジットカード
    isAvailabe(PaymentMethodsType.CONVENIENCE_STORE); // コンビニ
    isAvailabe(PaymentMethodsType.PAY_EASY); // pay easy
    isAvailabe(PaymentMethodsType.RESERVATION_ONLY); // 予約のみ利用可能

    // GMOP利用可否判定
    if (!this.pnrInfo?.orderEligibilities?.payment?.isWellnetPaymentEligible) {
      this.paymentMethod.set(PaymentMethodsType.CONVENIENCE_STORE, false); // コンビニ
      this.paymentMethod.set(PaymentMethodsType.INTERNET_BANKING, false); // インターネットバンキング
      this.paymentMethod.set(PaymentMethodsType.PAY_EASY, false); // “PE”(Payeasy)
    }

    // 予約のみ利用可能識別子=trueの場合、“RE”(予約のみ)
    this.paymentMethod.set(PaymentMethodsType.RESERVATION_ONLY, this.screenEntry.availableReservationsOnly); // 予約のみ利用可能

    // DSC以降開始後識別子=falseの場合、以下のキーを持つ利用可能判定をfalse(利用不可)とする。
    if (!this.isAfterStartingFrom) {
      this.paymentMethod.set(PaymentMethodsType.PAY_EASY, false); // “PE”(Payeasy)
    }
    // PNR情報取得レスポンス.data.air.isContainedBusniessKippuFares=trueの場合、以下のキーを持つ利用可能判定をfalse(利用不可)とする。
    if (this.pnrInfo?.air?.isContainedBusniessKippuFares) {
      this.paymentMethod.set(PaymentMethodsType.ANA_SKY_COIN, false); // “SC”(ANA SKYコイン)
      this.paymentMethod.set(PaymentMethodsType.PAYPAL, false); // “PP”(PayPal)
      this.paymentMethod.set(PaymentMethodsType.CONVENIENCE_STORE, false); // “CV”(コンビニエンスストア)
      this.paymentMethod.set(PaymentMethodsType.PAY_EASY, false); // “PE”(Pay-easy)
    }

    // 特定のFARE BASIS(社用運賃)の場合、クレカのみ選択可能とする
    if (this.pnrInfo?.air?.isCompanyStaffFare) {
      this.paymentMethod.set(PaymentMethodsType.CONVENIENCE_STORE, false); // “CV”(コンビニエンスストア)
      this.paymentMethod.set(PaymentMethodsType.PAY_EASY, false); // “PE”(Pay-easy)
    }

    // ASWDB(マスタ)よりユーザ共通.操作オフィスコード＝支払不可情報.オフィスにて取得した、支払不可情報.ユーザーエージェント検索文字列がユーザーエージェントに含まれる、かつ支払不可情報.支払方法利用可否フラグがfalseに設定されている支払方法について、支払方法利用可否判定マップ.<支払不可情報.支払方法>のvalueをfalseに設定する。
    this._unavailablePaymentList.forEach((paymentMethod) => {
      this.paymentMethod.set(paymentMethod, false);
    });

    this._shouldDisplayPaymentArea();
  }

  /**
   * 支払方法選択エリア表示する判定
   */
  private _shouldDisplayPaymentArea() {
    let count = 0;
    for (const [_, value] of this.paymentMethod) {
      if (value) count++;
      if (count > 1) {
        this.isDisplayPayMethodSelectionArea = true;
        return;
      }
    }
  }

  /**
   * 会員情報取得処理
   */
  public getMemberInformation() {
    // 会員情報取得API呼び出し
    this.subscribeService(
      'GetMemberInformationApi_paymentInput',
      this._common.amcMemberStoreService.saveMemberInformationToAMCMember$(),
      (result) => {}
    );
  }

  /**
   * 画面情報表示処理
   */
  public displayScreenInformation() {
    this._pageLoadingService.startLoading();
    // 購入時運賃再計算APIを実行したのでPNR情報を取得しなおす
    this._contService.invokeGetOrderApi(
      // 引数1：PNR情報取得APIのリクエストパラメータ
      this._contService.serviceCommonInformationAcuquisition(this.prevScreenInfo),
      // 引数2：PNR情報取得API成功時処理
      (response) => {
        this._pageLoadingService.endLoading();
        // PNR情報取得APIレスポンスを保存
        this.pnrInfo = response.data;

        // 支払方法選択表示判定
        this.paymentMethodDisplay();
        // 選択中の支払方法設定
        this.setSelectedPaymentMethod();
        // 支払方法がクレジットカード
        if (this.screenEntry.selectedPaymentMethod === PaymentMethodsType.CREDIT_CARD) {
          this.isCreditCardPayment = true; // クレジットカード決済対象
          this.isChangeCreditCard = true; // SPクレジットカード変更モード
        }
        // 画面初期表示判定
        this._isInitialDisplay = false;
        // 前画面引継情報.エラー情報がある場合の処理
        this._contService.previousScreenError();
        // 運賃・手荷物ルール取得APIを実行
        this.fareConditions();
        this.presenterComponent.resetPartsEvent();
      },
      // 引数3：PNR情報取得API失敗時処理
      (error) => {
        this._pageLoadingService.endLoading();
        // 継続不可能エラー
        this._errorsHandlerService.setNotRetryableError({
          errorType: ErrorType.BUSINESS_LOGIC, // ビジネスロジックエラー
          errorMsgId: 'E0096', // E0096: PNR取得失敗
          apiErrorCode: this._common.apiError?.errors?.[0]?.code, // APIエラーレスポンス情報
        });
      }
    );
  }

  /**
   * 特典利用者情報取得後の処理
   */
  selectPaymentMethod() {
    // 支払方法選択表示判定
    this.paymentMethodDisplay();
    // 選択中の支払方法設定
    this.setSelectedPaymentMethod();
    // 支払方法がクレジットカード
    if (this.screenEntry.selectedPaymentMethod === PaymentMethodsType.CREDIT_CARD) {
      this.isCreditCardPayment = true; // クレジットカード決済対象
      this.isChangeCreditCard = true; // SPクレジットカード変更モード
    }
    if (this._isInitialDisplay === true) {
      // 画面初期表示判定
      this._isInitialDisplay = false;
      // 前画面引継情報.エラー情報がある場合の処理
      this._contService.previousScreenError();
      // 運賃・手荷物ルール取得APIを実行
      this._subscriptions.add(
        this._fareConditionsInit$
          .pipe(
            filter((data): boolean => data),
            take(1)
          )
          .subscribe(() => {
            this._pageInitService.endInit(dynamicSubject.asObservable());
          })
      );
    }

    // クレジットカード情報.電話番号国
    const countryNumber = this.pnrInfo?.contacts?.representative?.phones?.[0]?.countryPhoneExtension;
    if (countryNumber) {
      const lang = Object.values(I18N_CONFIG.supportedLocales)[0];
      const country = this._paymentInputMasterData.countries.find(
        (item: MCountry) => item.international_tel_country_code === countryNumber
      );
      this.screenEntry.creditCardInformation.phoneCountry = country?.country_2letter_code ?? '';
    }
    // クレジットカード情報.電話番号国番号
    this.screenEntry.creditCardInformation.countryNumber = countryNumber ?? '';

    // 画面入力内容設定
    this.parts.creditCardParts.cardHolderInfoParts = {
      countryAll: this._paymentInputMasterData.countries,
      email: this.screenEntry.creditCardInformation.mailAddress,
      countryCode: this.screenEntry.creditCardInformation.phoneCountry,
      phoneNumber: this.screenEntry.creditCardInformation.phoneNumber,
    };
    this.parts.creditCardParts.creditCardReceiptParts = {
      issueReceipt: defaultDispPassengerName({ ...(this.pnrInfo?.travelers?.[0]?.names?.[0] ?? {}), title: undefined }),
    };
    this.parts = {
      ...this.parts,
      paymentMethodsParts: {
        selectedPaymentMethod: this.screenEntry.selectedPaymentMethod,
      },
      paymentAmountParts: {
        appliedDiscountType: this.appliedDiscountType,
        appliedAamDiscountCode: this._appliedAamDiscountCode,
      },
    };

    this._changeDetectorRef.markForCheck();
  }

  /**
   * ANA SKYコイン初期表示
   * @param responseAward 特典利用者情報
   */
  skyCoinAllocation(awardUsers?: GetAwardUsersResponseDataAwardUsersInner[]) {
    // 特典利用者情報が取得できた場合
    if (awardUsers) {
      this.anaSkyCoinInfo = [];
      // ANA SKYコイン残高取得
      let totalUsageCoinBalance = this._common.amcMemberStoreService.amcMemberData.skyCoinBalance ?? 0;
      // ANA SKYコイン利用額の合計
      this.totalUseCoin = 0;
      // ここから搭乗者数分繰り返し
      this.pnrInfo?.travelers?.forEach((traveler) => {
        if (traveler.id) {
          // ANA SKYコイン情報
          const travelerInfo: AnaSkyCoinInfo = {};
          // 搭乗者ID
          travelerInfo.travelerId = traveler.id;
          // 搭乗者名
          travelerInfo.travelerName = defaultDispPassengerName(traveler.names?.[0] ?? {});
          // 充当可能上限コイン
          const unitPrices = this.pnrInfo?.prices?.unitPrices;
          travelerInfo.ticketPrice = unitPrices?.[traveler.id]?.ticketPrices?.total?.[0]?.value ?? 0;

          // 利用額入力欄
          travelerInfo.usageCoin = 0;
          // 当該搭乗者.names[0].lastName+当該搭乗者.names[0].firstName
          const travelerName = (traveler.names?.[0]?.lastName ?? '') + (traveler.names?.[0]?.firstName ?? '');
          // 充当可能上限コイン>0、かつ
          // 当該搭乗者.names[0].lastName+当該搭乗者.names[0].firstNameと一致する特典利用者情報取得APIレスポンス.data.awardUsers配下のname(※スペースを除去)が存在する場合
          if (
            (travelerInfo.ticketPrice ?? 0) > 0 &&
            awardUsers?.find((item) => item.name?.replace(/[/\s]/g, '') === travelerName)
          ) {
            // (ANA SKYコイン残高-当該搭乗者の上に表示している搭乗者のANA SKYコイン利用額入力欄の合計)>0の場合、以下の条件に該当する値
            if (totalUsageCoinBalance - this.totalUseCoin > 0) {
              // (ANA SKYコイン残高-当該搭乗者の上に表示している搭乗者のANA SKYコイン利用額入力欄の合計-充当可能上限コイン)≧0の場合
              if (totalUsageCoinBalance - this.totalUseCoin - (travelerInfo.ticketPrice ?? 0) >= 0) {
                // 充当可能上限コイン
                travelerInfo.usageCoin = Math.ceil((travelerInfo.ticketPrice ?? 0) / 10) * 10;
              } else {
                // ANA SKYコイン残高-当該搭乗者の上に表示している搭乗者のANA SKYコイン利用額入力欄の合計
                travelerInfo.usageCoin = Math.ceil((totalUsageCoinBalance - this.totalUseCoin) / 10) * 10;
              }
            }
          }
          // ANA SKYコイン情報保存
          this.totalUseCoin += travelerInfo.usageCoin;

          this.anaSkyCoinInfo.push(travelerInfo);
        }
      }); // ここまで搭乗者数分繰り返し
    }

    const _parts = { ...this.parts };
    _parts.creditCardParts.skyCoinUsageParts.anaSkyCoinInfo = this.anaSkyCoinInfo;
    _parts.skyCoinParts.skyCoinUsageParts.anaSkyCoinInfo = this.anaSkyCoinInfo;
    this.parts = _parts;

    this._changeDetectorRef.detectChanges();
  }

  /**
   * 運賃・手荷物ルール取得
   *
   * @param endIntFunc? 初期処理終了のファンクション。本ファンクションが呼ばれた場合に初期処理終了を呼ぶパターンがあるので引数として受け取る。
   */
  fareConditions(endIntFunc?: () => void, isNotLoading?: boolean) {
    if (!isNotLoading) {
      this._pageLoadingService.startLoading();
    }
    // 運賃・手荷物ルール取得APIを実行
    this._contService.invokeGetFareConditionsApi(
      this._contService.generateFareConditionApiParam(this.prevScreenInfo),
      (response) => {
        if (!isNotLoading) {
          this._pageLoadingService.endLoading();
        }
        const paymentInputDynamicParams = {
          ...dynamicSubject.getValue(),
          fareConditionsReply: response,
        };
        dynamicSubject.next(paymentInputDynamicParams);
        if (endIntFunc) {
          endIntFunc();
        }
        this.showInitialContents();
      },
      (error) => {
        if (!isNotLoading) {
          this._pageLoadingService.endLoading();
        }
        this._errorsHandlerService.setRetryableError(PageType.PAGE, { errorMsgId: 'E0948' });
        if (endIntFunc) {
          endIntFunc();
        }
        this.showInitialContents();
      }
    );
  }

  /**
   * 9.支払方法表示判定
   */
  paymentMethodDisplay() {
    const paymentInputInfo = { ...this._paymentInputStoreService.paymentInputData };
    if (this._isInitialDisplay === true) {
      // ウェルネット決済利用可否判定
      // 限度額と比較するための支払総額
      const totalPrice = this.pnrInfo?.prices?.totalPrices?.total?.[0]?.value ?? 0;
      let isIbAvailable = true;
      // コンビニエンスストア利用可否判定
      const convenienceStoreMaximumPaymentAmount = Number(
        this._aswMasterService.getMPropertyByKey('paymentInformationInput', 'convenienceStoreMaximumPaymentAmount')
      );
      const isCvAvailable = !(
        convenienceStoreMaximumPaymentAmount && convenienceStoreMaximumPaymentAmount < totalPrice
      );
      if (this.paymentMethod.get(PaymentMethodsType.CONVENIENCE_STORE)) {
        if (!isCvAvailable) {
          this.paymentMethod.set(PaymentMethodsType.CONVENIENCE_STORE, false);
        }
      }
      // 支払方法のカウント
      let counter = 0;
      this.paymentMethod.forEach((value, key) => {
        if (value && key !== PaymentMethodsType.KEEP_MY_FARE) counter++;
      });
      if (counter > 1) {
        this.isDisplayPaymentMethodSelection = true;
      }
      // 選択中支払方法が利用不可の場合、選択中支払方法を未選択にする
      if (
        this.screenEntry.selectedPaymentMethod &&
        this.paymentMethod.get(this.screenEntry.selectedPaymentMethod) === false
      ) {
        this.screenEntry.selectedPaymentMethod = '';
      }
      if (isSP()) {
        this.isChangePaymentMethod = true; // SP支払方法変更モード判定
        this.isChangeCreditCard = true; // SPクレジットカード変更モード判定
      }
      this._availablePaymentMethodWithoutDevice.set(PaymentMethodsType.CONVENIENCE_STORE, isCvAvailable);
    }

    this._changeDetectorRef.markForCheck();
  }

  /**
   * 10.選択中の支払方法設定
   */
  setSelectedPaymentMethod() {
    if (this._isInitialDisplay || this.screenEntry.selectedPaymentMethod === '') {
      if (this.paymentMethod.get(PaymentMethodsType.CREDIT_CARD)) {
        this.screenEntry.selectedPaymentMethod = PaymentMethodsType.CREDIT_CARD;
      }
      // 10.2 上記で支払方法が決まらなかった場合、支払方法利用可否判定マップから決定
      if (this.screenEntry.selectedPaymentMethod === '') {
        for (const [key, value] of this.paymentMethod) {
          if (value) {
            this.screenEntry.selectedPaymentMethod = key;
            break;
          }
        }
      }
      // 10.3 選択中支払方法を変更前支払方法として保持する
      this.screenEntry.prevPaymentMethod = this.screenEntry.selectedPaymentMethod;
      this.data.paymentMethodsData.selectedPaymentMethod = this.screenEntry.selectedPaymentMethod;
    }
  }

  /**
   * 受け渡された情報更新処理
   * @param data 渡されたデータ
   */
  dataUpdateEvent(data: PaymentInputPresData): void {
    this.isChangeCreditCard = data.paymentMethodsData.isChangeCreditCard;
    this.isChangePaymentMethod = data.paymentMethodsData.isChangePaymentMethod;
  }

  /**
   * 初期表示処理終了後に画面描画開始
   */
  showInitialContents() {
    this.isReadyToShow = true;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * 予約可否判断APIストアのデータが存在しない場合共通エラーに遷移
   */
  private checkStoreData(): void {
    const hasData = this._ordersReservationAvailabilityStoreService.hasValidData();
    if (!hasData) {
      this._errorsHandlerService.setNotRetryableError({
        errorType: ErrorType.BUSINESS_LOGIC, // ビジネスロジックエラー
        errorMsgId: 'E0108',
        apiErrorCode: this._common.apiError?.errors?.[0]?.code, // APIエラーレスポンス情報
      });
    }
  }
}
