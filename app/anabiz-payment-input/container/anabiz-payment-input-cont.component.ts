import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { PaymentInputInitMOffice, PreviousScreenHandoverInformation } from '@app/payment-input';
import { PaymentInputContService } from '@app/payment-input/container/payment-input-cont.service';
import { apiEventAll, getPaxName, getPhoneCountryList, makeShareholderCoupons, submitNavigate } from '@common/helper';
import { CountryCodeNameType, PassengerType, ShareholderCouponsType } from '@common/interfaces';
import { MCountry } from '@common/interfaces/master/m_country';
import {
  CurrentCartStoreService,
  DeliveryInformationStoreService,
  FareConditionsStoreService,
  GetOrderStoreService,
  PaymentInputStoreService,
} from '@common/services';
import { GetOrderState } from '@common/store/get-order/get-order.state';
import { I18N_CONFIG } from '@conf/i18n.config';
import { environment } from '@env/environment';
import { SupportPageComponent } from '@lib/components/support-class';
import { ApiCommonRequest, ErrorType, LoginStatusType, MOffice, PageType, RetryableError } from '@lib/interfaces';
import { StaticMsgPipe, LinkUrlPipe } from '@lib/pipes';
import {
  AswMasterService,
  AswServiceStoreService,
  CommonLibService,
  ErrorsHandlerService,
  PageInitService,
  PageLoadingService,
} from '@lib/services';
import { AswCommonState } from '@lib/store';
import { BehaviorSubject, take } from 'rxjs';
import { FareConditionsRequest, GetOrderRequest, GetOrderResponseData, Type1 } from 'src/sdk-servicing';
import { AnabizPaymentInputPresComponent } from '../presenter/anabiz-payment-input-pres.component';
import { AnabizPaymentInputContService } from './anabiz-payment-input-cont.service';
import { initAnabizCreditCardInformation } from './anabiz-payment-input-cont.state';
import {
  AnabizPaymentInputMasterData,
  AnabizCreditCardInformation,
  getAnabizPaymentInformationRequestMasterKey,
  AnabizPaymentInputDynamicParams,
  defaultAnabizPaymentInputDynamicParams,
} from './anabiz-payment-input-cont.state';
import { RoutesResRoutes } from '@conf/routes.config';
import { Router } from '@angular/router';

// 予約詳細画面へ連携する検索方法選択
const SEARCH_METHOD_SELECTION = 'order'; // 予約番号で検索
// 予約詳細画面へ連携する連携サイトID
const COLLABORAITION_SITE_ID = 'ALL_APP'; // ASW内の他アプリからの遷移

@Component({
  selector: 'asw-anabiz-payment-input-cont',
  templateUrl: './anabiz-payment-input-cont.component.html',
  styleUrls: ['./anabiz-payment-input-cont.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnabizPaymentInputContComponent extends SupportPageComponent {
  // 初期化処理自動完了をオフにする
  override autoInitEnd = false;
  // PNR情報
  public pnrInfo: GetOrderResponseData | undefined = {};

  // 前画面引継ぎ情報
  public prevScreenInfo: PreviousScreenHandoverInformation = {
    orderId: '',
    credential: {
      firstName: '',
      lastName: '',
    },
  };

  public isReadyToShow: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** 遷移元画面情報 */
  private _previousPage: string = '';
  /** 画面情報.機能ID (新規予約) */
  public functionId: string = 'R01';
  /** 画面情報.ページID (ANA Biz支払情報入力) */
  public pageId: string = 'P083';

  /** パスワード認証実施済み判定 (AMC会員のクレジットカード情報表示可否の判定のため) */
  public isPasswordAuthenticationPerformed: boolean = false; // 未認証
  /**  画面初期表示判定 */
  private _isInitialDisplay: boolean = true; // 初期表示
  /** プロモーションコード適用判定 (true:適用可 / false:適用不可) */
  public isApplicableDiscountCode: boolean = false;
  /** 6. プロモーションコード変更判定 */
  public isChangePromotionCode: boolean = false; // 変更なし
  /** 適用済プロモーション種別 ('CAT25' / 'AAM') */
  public appliedDiscountType: string = '';

  /** 代表者連絡先情報 */
  private _representativeContacts: string = '';

  /**国.国コード(2レター) 国(国際化).国名称*/
  public phoneCountryInfoList: Array<CountryCodeNameType> = [];
  public phoneCountryInfoListMaster: Array<CountryCodeNameType> = [];
  /** 国の取得 */
  public countryAll: Array<MCountry> = [];

  //カードレス決済(契約形態が"P"、または" BPS ")
  public isCardless: boolean = false;
  // 予約のみ識別子
  public isReserveOnly: boolean = false;
  // 空席待ち
  public isWaitlisted: boolean = false;
  // 承認者ID
  public approverId: string = '';
  // 選択中支払い方法
  public selectedPaymentMethod: string = '';
  // 出張者識別子
  public isTraveler: boolean = false;
  // クレジットカード決済対象判定
  public isCreditCardPayment: boolean = false;
  // クレジットカード情報
  public creditCardInfo: AnabizCreditCardInformation = initAnabizCreditCardInformation();

  public _appliedAamDiscountCode: string = '';

  //発券要求コメント
  public ticketingRequestComment: string = '';

  // 発券要求機能を使用可能
  public issueFlag: string = '';

  /** 株主優待情報エリア表示可否 */
  public isShowShareholderCouponsArea: boolean = false;
  /** 株主優待券情報 */
  public shareholderCoupons?: Array<ShareholderCouponsType>;

  //予約のみ選択可能識別子
  public isOnholdEligible: boolean = false;

  // 操作オフィス情報
  public currentOfficeInfo: MOffice = PaymentInputInitMOffice();

  private _anabizPaymentInputMasterData: AnabizPaymentInputMasterData = {
    paymentInformations: [],
    countries: [],
    offices: [],
    posCountry: {},
    posCountryJp: [],
  };

  /** 画面情報 */
  private _paymentInputInfo = { ...this._paymentInputStoreService.paymentInputData };

  /** 動的文言 */
  private dynamicSubject = new BehaviorSubject<AnabizPaymentInputDynamicParams>(
    defaultAnabizPaymentInputDynamicParams()
  );

  @ViewChild(AnabizPaymentInputPresComponent) anaBizPresComponent!: AnabizPaymentInputPresComponent;

  constructor(
    private _common: CommonLibService,
    private _title: Title,
    private _currentCartStoreService: CurrentCartStoreService,
    private _aswServiceService: AswServiceStoreService,
    private _pageInitService: PageInitService,
    private _fareConditionsStoreService: FareConditionsStoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _paymentInputStoreService: PaymentInputStoreService,
    private _getOrderStoreService: GetOrderStoreService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _linkUrl: LinkUrlPipe,
    private _masterSvc: AswMasterService,
    private _staticMsg: StaticMsgPipe,
    private _contService: AnabizPaymentInputContService,
    private _paymentContService: PaymentInputContService,
    private _deliveryInfoStoreService: DeliveryInformationStoreService,
    private _pageLoadingService: PageLoadingService,
    private _router: Router
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

    // 2. 当画面の情報を設定
    const commonStateParams: AswCommonState = {
      functionId: this.functionId,
      pageId: this.pageId,
      subFunctionId: '',
      subPageId: '',
      isEnabledLogin: false,
    };
    this._common.aswCommonStoreService.setAswCommon(commonStateParams);
  }

  reload(): void {}

  /**
   * 初期表示処理
   */
  init(): void {
    // 動的文言取得
    this.getDynamicContent();
    // 前画面情報
    const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId;
    if (cartId) {
      this.prevScreenInfo.orderId = this._deliveryInfoStoreService.deliveryInformationData.passToPayment?.orderId ?? '';
      this.prevScreenInfo.credential.firstName =
        this._deliveryInfoStoreService.deliveryInformationData.passToPayment?.credential?.firstName ?? '';
      this.prevScreenInfo.credential.lastName =
        this._deliveryInfoStoreService.deliveryInformationData.passToPayment?.credential?.lastName ?? '';
      this.executeGetOrderApi();
    } else {
      this._aswServiceService
        .getAswService$()
        .pipe(take(1))
        .subscribe(({ orderId, firstName, lastName }) => {
          this.prevScreenInfo.orderId = orderId ?? '';
          this.prevScreenInfo.credential.firstName = firstName ?? '';
          this.prevScreenInfo.credential.lastName = lastName ?? '';
          this.executeGetOrderApi();
        });
    }

    // 3. AMC会員のクレジットカード情報の表示可否を判断するために、認証実施済み判定を保持する。
    this.isPasswordAuthenticationPerformed = false;
    // 4.画面初期表示判定として、true(初期表示)を保持する。
    this._isInitialDisplay = true;
    // 5.プロモーションコード変更判定としてfalse(変更なし)を設定
    this._paymentInputInfo.isChangePromotionCode = false;
  }

  /**
   * 初期表示処理内でのPNR情報取得処理実行
   */
  executeGetOrderApi() {
    // 6. PNR情報取得APIのリクエストパラメータ作成
    let getOrderRequestParam: GetOrderRequest = this._contService.serviceCommonInformationAcuquisition(
      this._currentCartStoreService.CurrentCartData.data?.cartId ?? '',
      this.prevScreenInfo
    );

    // 7. PNR情報取得APIの実行
    // PNR情報取得API実行後処理
    apiEventAll(
      () => {
        this._getOrderStoreService.setGetOrderFromApi(getOrderRequestParam);
      },
      this._getOrderStoreService.getGetOrderObservable(),
      (response: GetOrderState) => {
        // PNR情報取得APIレスポンスを保存
        this.pnrInfo = response.data;
        // 出張者識別子
        if (!this.pnrInfo?.orderEligibilities?.payment?.isAnaBizApprovalEligible) {
          this.isTraveler = true;
        }

        this._paymentInputStoreService.setPaymentInput(this._paymentInputInfo);
        // タブバーに画面タイトルを設定する
        this.setTabBarTitle();
        // サブヘッダに反映するためmarkForCheck
        this._changeDetectorRef.markForCheck();

        // 初期表示処理実行
        this.initialDisplayProcessing();
      },
      () => {
        // APIレスポンスが不合格の場合継続不可能エラー - businessLogic）
        this._errorsHandlerSvc.setNotRetryableError({
          errorType: ErrorType.BUSINESS_LOGIC, // ビジネスロジックエラー
          errorMsgId: 'E0096', // E0096: PNR取得失敗
          apiErrorCode: this._common.apiError?.errors?.[0]?.code, // APIエラーレスポンス情報
        });
      }
    );
  }

  /**
   * タブバータイトル設定
   */
  setTabBarTitle() {
    let title = 'label.paymentInformation.title';
    if (this.isTraveler) {
      title = 'label.ANABizPaymentInput';
    }
    this.forkJoinService(
      'anabizPaymentInputCont_setTitle',
      [this._staticMsg.get(title), this._staticMsg.get('label.aswPageTitle')],
      ([str1, str2]) => {
        this.deleteSubscription('anabizPaymentInputCont_setTitle');
        if (str1 && str2) {
          this._title.setTitle(str1 + str2);
        }
      }
    );
  }

  /**
   * 動的文言取得
   */
  getDynamicContent() {
    const isSubPage = true;

    this.subscribeService(
      'anabizPaymentInputCont_setDynamicMessageId',
      this._common.dynamicContentService.getDynamicContent$(isSubPage),
      (jsPath) => {
        this.deleteSubscription('anabizPaymentInputCont_setDynamicMessageId');
      }
    );
  }

  destroy(): void {}

  /**
   * 正常にPNR情報が取得できた後の初期表示処理
   */
  initialDisplayProcessing() {
    // 9.利用不可判定
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
      this._pageInitService.endInit(this.dynamicSubject.asObservable()); // ローディング終了
      return;
    }

    // 10~11 ASWDB(マスタ)取得処理
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    this.subscribeService(
      'anabizPaymentInputCont_getMasterDataAll',
      this._masterSvc.load(getAnabizPaymentInformationRequestMasterKey(lang), true),
      (data) => {
        [
          this._anabizPaymentInputMasterData.paymentInformations,
          this._anabizPaymentInputMasterData.countries,
          this._anabizPaymentInputMasterData.offices,
          this._anabizPaymentInputMasterData.posCountry,
          this._anabizPaymentInputMasterData.posCountryJp,
        ] = data;

        this.deleteSubscription('anabizPaymentInputCont_getMasterDataAll');
        const posCode = this._common.aswContextStoreService.aswContextData.posCountryCode;
        const _phoneCountryInfoListMaster = getPhoneCountryList(
          this._anabizPaymentInputMasterData.posCountry,
          this._anabizPaymentInputMasterData.posCountryJp,
          posCode
        );
        _phoneCountryInfoListMaster
          .filter((pos) => pos.isTranslate)
          .forEach((pos) => (pos.countryName = this._staticMsg.transform(pos.countryName)));
        this.phoneCountryInfoListMaster = _phoneCountryInfoListMaster;
        this.countryAll = this._anabizPaymentInputMasterData.countries;

        //国IPに対して、言語に合わせて、国番号に合わせて表示します。
        this.phoneCountryInfoList = this.phoneCountryInfoListMaster;
        //※アメリカ・カナダについては、ASWDB(マスタ)で管理している電話番号国用の名称で表示する。
        this.phoneCountryInfoList = this.phoneCountryInfoList.map((item) => ({
          ...item,
          countryCode: item.countryCode ?? '-',
        }));

        // 操作オフィス情報取得
        const operationOfficeCode = this._common.aswContextStoreService.aswContextData.pointOfSaleId;
        this.currentOfficeInfo =
          this._anabizPaymentInputMasterData.offices.find(
            (moffice: MOffice) => moffice.office_code === operationOfficeCode
          ) ?? this.currentOfficeInfo;

        this._changeDetectorRef.markForCheck();
        this._changeDetectorRef.detectChanges();

        // 12 カート情報とPNR情報とで代表者の連絡先情報の取得元を切り替えるために、以下の値を代表者連絡先情報とする。
        const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId;
        if (cartId) {
          // 12.1 操作中のカート情報がある場合、カート情報から取得
          this._representativeContacts =
            this._currentCartStoreService.CurrentCartData.data?.plan?.contacts?.representative?.emails?.[0]?.address ??
            '';
        } else {
          // 12.2 操作中のカート情報がない場合、PNR情報から取得
          this._representativeContacts = this.pnrInfo?.contacts?.representative?.emails?.[0]?.address ?? '';
        }

        // 13 ANA Bizログイン情報.契約形態によって、以下の情報を利用企業情報として保持する。
        // 発券要求機能の使用可否判定をANA Bizログイン情報より取得
        const isIssuable = String(this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.isIssuable);
        if (isIssuable) {
          this.issueFlag = isIssuable;
        }

        // 14 画面入力内容の保持
        this.setAnaBizScreenEntity();

        // 15.AAMプロモーションコード適用可能判定
        this.getDiscountCodeApplicabilityStatus();

        // 16 運賃・手荷物ルール取得APIを実行
        this.fareConditions(true);

        if (this._isInitialDisplay === true) {
          // 画面初期表示判定
          this._isInitialDisplay = false;
          // Reputation Manager Install
          this._contService.reputationManagerInstall();
          // 前画面引継情報.エラー情報がある場合の処理
          this._contService.previousScreenError();
        }
        this.isReadyToShow.next(true);

        // 動的文言
        this.dynamicSubject.next({
          getOrderReply: { data: this.pnrInfo },
          fareConditionsReply: this._fareConditionsStoreService.fareConditionsData,
          pageContext: {
            currentPaymentMethod: this.selectedPaymentMethod,
          },
        });
        this._pageInitService.endInit(this.dynamicSubject.asObservable()); // ローディング終了

        this._changeDetectorRef.markForCheck();
        this._changeDetectorRef.detectChanges();
      }
    );
  }

  /**
   * ANABiz支払画面情報設定
   */
  setAnaBizScreenEntity() {
    // 発券要求コメント
    this.ticketingRequestComment = this.pnrInfo?.anaBizTicketingRequests?.at(-1)?.comment ?? '';
    // 承認者ID
    this.approverId = this.pnrInfo?.anaBizTicketingRequests?.at(-1)?.approver?.id ?? '';
    // 予約のみ識別子
    this.isReserveOnly = false;
    // 空席待ち予約識別子
    if (this.pnrInfo?.air?.isContainedWaitlistedSegment) {
      this.isWaitlisted = this.pnrInfo?.air?.isContainedWaitlistedSegment;
    }

    //予約のみが可能識別子
    this.isOnholdEligible = this.pnrInfo?.orderEligibilities?.payment?.isOnholdEligible ?? false;

    // クレジットカード決済対象判定
    const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId;
    const issueType = this._common.anaBizContextStoreService.anaBizContextData.allBizContext?.issueType ?? undefined;
    if (!this.isWaitlisted && issueType !== 0 && issueType !== undefined && this.issueFlag === '1') {
      this.isCreditCardPayment = true;
    }

    if ((issueType === 0 && issueType !== undefined) || !(issueType === 1 && this.issueFlag === '1')) {
      this.isCardless = true;
    }
    // クレジットカード情報
    const traveler = this.pnrInfo?.travelers?.[0];

    const countryNumber = this.pnrInfo?.contacts?.representative?.phones?.[0]?.countryPhoneExtension;
    let phoneCountry = '';
    if (countryNumber) {
      const lang = Object.values(I18N_CONFIG.supportedLocales)[0];
      const country = this._anabizPaymentInputMasterData.countries.find(
        (item: MCountry) => item.international_tel_country_code === countryNumber
      );
      phoneCountry = country?.country_2letter_code ?? '';
    }

    const tempCreditCardInfo: AnabizCreditCardInformation = {
      selectedCreditCard: 'other',
      cardNumber: '',
      expiryDate: '',
      holderName: '',
      isUatpCard: false,
      securityCode: '',
      cardHolder: '',
      mailAddress: this._representativeContacts,
      confirmmailAddress: this._representativeContacts,
      phoneCountry: phoneCountry,
      countryNumber: countryNumber ?? '',
      phoneNumber: this.pnrInfo?.contacts?.representative?.phones?.[0]?.number ?? '',
      isSkyCoin: false,
      isCardUpdate: false,
    };

    this.creditCardInfo = tempCreditCardInfo;

    // 株主優待情報
    const prefix = this._masterSvc.getMPropertyByKey('paymentInformationInput', 'shareholderCoupons.numberPrefix');
    this.shareholderCoupons = this.pnrInfo?.air?.isContainedShareholdersBenefitDiscountFare
      ? makeShareholderCoupons(this.pnrInfo?.air?.bounds, this.pnrInfo?.travelers, prefix)
      : [];
    this.isShowShareholderCouponsArea = (this.shareholderCoupons?.flatMap((bound) => bound.flights).length ?? 0) > 0;

    /**選択中支払方法 */
    if (
      this.isCreditCardPayment ||
      (!this.isTraveler && !this.isOnholdEligible && !this.pnrInfo?.air?.isContainedWaitlistedSegment)
    ) {
      this.selectedPaymentMethod = 'CD';
    }

    this._changeDetectorRef.detectChanges();
    this.anaBizPresComponent.refresh();
    this.anaBizPresComponent.updateAgreement();
  }

  /**
   *  プロモーションコード適用判定 (true:適用可 / false:適用不可)
   */
  getDiscountCodeApplicabilityStatus() {
    const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId;
    // プロモーションコード適用済判定
    this.appliedDiscountType = ''; // 適用済みプロモーション種別なし
    this.isApplicableDiscountCode = false; // AAMプロモーションコード適用不可
    if (this.pnrInfo?.prices?.totalPrices?.discount?.cat25DiscountName) {
      this.appliedDiscountType = 'CAT25'; // CAT25プロモーションコード適用済
    } else if (this.pnrInfo?.prices?.totalPrices?.discount?.aamDiscountCode) {
      this.appliedDiscountType = 'AAM'; // AAMプロモーションコード適用済

      // 適用済AAMプロモーションコード
      this._appliedAamDiscountCode = this.pnrInfo?.prices?.totalPrices?.discount?.aamDiscountCode ?? '';
    } else if (cartId && this.currentOfficeInfo.promotion_available_flag) {
      this.isApplicableDiscountCode = true; // AAMプロモーションコード適用可能
    }
  }

  /**
   * 運賃・手荷物ルール取得
   */
  fareConditions(isNotLoading?: boolean) {
    if (!isNotLoading) {
      this._pageLoadingService.startLoading();
    }
    // 操作中のカート情報取得
    const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId;
    // 運賃・手荷物ルール取得API実行のためのパラメータを作成
    const fareConditionsRequestParam: FareConditionsRequest = {
      orderId: this.prevScreenInfo.orderId, // 前画面引継ぎ情報
      credential: {
        firstName: this.prevScreenInfo.credential.firstName, // 前画面引継ぎ情報.代表者名
        lastName: this.prevScreenInfo.credential.lastName, // 前画面引継ぎ情報.代表者姓
      },
      cartId: cartId || undefined,
      commonIgnoreErrorFlg: true, // エラーハンドリング回避
    };
    // 運賃・手荷物ルール取得APIを実行
    apiEventAll(
      () => {
        this._fareConditionsStoreService.setFareConditionsFromApi(fareConditionsRequestParam);
      },
      this._fareConditionsStoreService.getFareConditions$(),
      () => {
        if (!isNotLoading) {
          this._pageLoadingService.endLoading();
        }
      },
      () => {
        if (!isNotLoading) {
          this._pageLoadingService.endLoading();
        }
        this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: 'E0948' });
      }
    );
  }

  /**
   * 画面情報表示処理(プロモーションコード適用・解除後処理)
   */
  public displayScreenInformation() {
    this._pageLoadingService.startLoading();
    // 購入時運賃再計算APIを実行したのでPNR情報を取得しなおす
    this._paymentContService.invokeGetOrderApi(
      // 引数1：PNR情報取得APIのリクエストパラメータ
      this._paymentContService.serviceCommonInformationAcuquisition(this.prevScreenInfo),
      // 引数2：PNR情報取得API成功時処理
      (response) => {
        this._pageLoadingService.endLoading();
        // PNR情報取得APIレスポンスを保存
        this.pnrInfo = response.data;
        this.getDiscountCodeApplicabilityStatus();

        // 画面初期表示判定
        this._isInitialDisplay = false;
        // 13. Reputation Manager Install
        this._contService.reputationManagerInstall();
        // 前画面引継情報.エラー情報がある場合の処理
        this._contService.previousScreenError();
        // 運賃・手荷物ルール取得APIを実行
        this.fareConditions();
      },
      // 引数3：PNR情報取得API失敗時処理
      (error) => {
        this._pageLoadingService.endLoading();
        // 継続不可能エラー
        this._errorsHandlerSvc.setNotRetryableError({
          errorType: ErrorType.BUSINESS_LOGIC, // ビジネスロジックエラー
          errorMsgId: 'E0096', // E0096: PNR取得失敗
          apiErrorCode: this._common.apiError?.errors?.[0]?.code, // APIエラーレスポンス情報
        });
      }
    );
  }
}
