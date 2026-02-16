import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
  ElementRef,
  Renderer2,
  NgZone,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  CurrentCartStoreService,
  FareConditionsStoreService,
  GetOrderStoreService,
  PaymentInputStoreService,
  DcsDateService,
} from '@common/services';
import { AgreementAreaParts } from '@lib/components';
import { DialogClickType, DialogInfo, DialogType, ErrorType, LogType, MOffice, PageType } from '@lib/interfaces';
import {
  AswMasterService,
  CommonLibService,
  DialogDisplayService,
  ErrorsHandlerService,
  LoadScriptService,
  LoggerDatadogService,
  ModalService,
} from '@lib/services';
import { filter, throttleTime } from 'rxjs/operators';
import {
  AnaSkyCoinInfo,
  PaymentInputScreenEntryInfo,
  PaymentInputCardInfo,
  PaymentInputCardHolderInfo,
  screenEntryData,
  PaymentInputInitMOffice,
  PreviousScreenHandoverInformation,
  initPreviousScreenHandoverInformation,
  dynamicSubject,
} from '../container/payment-input-cont.state';
import { isSP, isTB, isPC } from 'src/lib/helpers';
import { fromEvent, from, map, of, timer } from 'rxjs';
import { StaticMsgPipe } from '@lib/pipes';
import { PaymentInputSkyCoinComponent } from '../sub-components/payment-input-sky-coin/payment-input-sky-coin.component';
import {
  defaultPaymentDetailsModalParts,
  PaymentDetailsPayload,
} from '../sub-components/modal/payment-details/payment-details.state';
import { MasterStoreKey } from '@conf/asw-master.config';
import { getFareConditionsMasterKey } from './payment-input-pres.state';
import { fareConditionDetailsModalParts } from '@common/components/reservation/plan-review/fare-condition-details/fare-condition-details.state';
import { OutputFareConditionsPerPtc } from '@common/interfaces/reservation/plan-review/output-fare-conditions-per-ptc.interface';
import { OutputFareConditionsPerBound } from '@common/interfaces/reservation/plan-review/output-fare-conditions-per-bound.interface';
import { CountryCodeNameType, FlightType, ShareholderCouponsType, TravelerType } from '@common/interfaces';
import { GetOrderResponseData } from 'src/sdk-servicing/model/models';
import { getAirportNameFromCache } from '@common/helper';
import {
  PaymentInputPresData,
  PaymentInputPresParts,
  initPaymentInputPresParts,
  initPaymentInputPresData,
} from './payment-input-pres.state';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import {
  PaymentInputInternetBankingData,
  initPaymentInputInternetBankingData,
} from '../sub-components/payment-input-internet-banking/payment-input-internet-banking.state';
import {
  PaymentInputSkyCoinData,
  initPaymentInputSkyCoinData,
} from '../sub-components/payment-input-sky-coin/payment-input-sky-coin.state';
import { FareConditionsResponseDataAirOfferConditionsPtc } from '../../../sdk-servicing/model/fareConditionsResponseDataAirOfferConditionsPtc';
import {
  PaymentInputRequestCreditCardData,
  initPaymentInputRequestCreditCardData,
} from '../sub-components/payment-input-credit-card/payment-input-credit-card.state';
import {
  PaymentInputPaymentMethodsData,
  initPaymentInputPaymentMethodsData,
} from '../sub-components/payment-input-payment-methods/payment-input-payment-methods.state';
import {
  PaymentAmountData,
  PaymentDetailsData,
  initPaymentAmountData,
} from '../sub-components/payment-input-payment-amount/payment-input-payment-amount.state';
import { PaymentInputCreditCardComponent } from '../sub-components/payment-input-credit-card/payment-input-credit-card.component';
import { paymentTermsModalParts } from '../sub-components/modal/payment-terms/payment-terms.state';
import { PaymentInputInternetBankingComponent } from '../sub-components/payment-input-internet-banking/payment-input-internet-banking.component';
import { PaymentInputPaymentMethodsComponent } from '../sub-components/payment-input-payment-methods/payment-input-payment-methods.component';
import { PaymentInputShareholderCouponComponent } from '../sub-components/payment-input-shareholder-coupon/payment-input-shareholder-coupon.component';
import { first } from 'rxjs/operators';
import { PaymentMethodsType } from '@common/interfaces/common/payment-methods';
import { RegisteredCardTypeEnum } from '../sub-components/payment-input-common/payment-input-card-selecting';
import { PaymentInputPresTicketingService } from './payment-input-pres-ticketing.service';
import { PaymentInputPresService } from './payment-input-pres.service';
import { useCouponsPayloadParts } from '../sub-components/modal/use-coupons/use-coupons-payload.state';
import { MBankWellnet } from '@common/interfaces/common/m_bank_wellnet';
import { RoutesResRoutes } from '@conf/routes.config';
import { Router } from '@angular/router';
import { PageLoadingService } from '@lib/services/page-loading/page-loading.service';
import { ErrorCodeConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-payment-input-pres',
  templateUrl: './payment-input-pres.component.html',
  styleUrls: ['./payment-input-pres.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputPresComponent
  extends SubComponentModelComponent<PaymentInputPresData, PaymentInputPresParts>
  implements OnChanges, AfterViewInit
{
  //SubComponentModelComponent用設定
  _parts = initPaymentInputPresParts();
  _data = initPaymentInputPresData();

  // 初期表示可否判定
  @Input() isReadyToShow: boolean = false;
  // 画面情報
  @Input() screenEntry: PaymentInputScreenEntryInfo = screenEntryData();
  // PNR情報
  @Input() pnrInfo: GetOrderResponseData | undefined = {};
  // Keep My Fare 表示識別子
  @Input() isDisplayKeepMyFare: boolean = false;
  // 有料サービス申し込み
  @Input() isAncillaryService: boolean = false;
  // プロモーションコード適用判定
  @Input() isApplicableDiscountCode: boolean = false;
  // 支払方法選択表示判定
  @Input() isDisplayPaymentMethodSelection: boolean = false;
  // プロモーション種別
  @Input() appliedDiscountType: string = '';
  // ウェルネット決済可能銀行リスト
  @Input() availableBankList: Array<MBankWellnet> = [];
  // ウェルネット銀行リスト
  @Input() wellnetBankList: Array<MBankWellnet> = [];
  /** 国.国コード(2レター) 国(国際化).国名称 */
  @Input() phoneCountryInfoList: Array<CountryCodeNameType> = [];
  // 支払い情報利用可否判定マップ
  @Input() paymentMethod: Map<String, boolean> = new Map();
  @Input() currentOfficeInfo: MOffice = PaymentInputInitMOffice();
  // ANA SKYコイン利用額総計
  @Input() totalUseCoin: number = 0;
  // SP支払方法変更モード判定
  @Input() isChangePaymentMethod = false;
  // SPクレジットカード変更モード判定
  @Input() isChangeCreditCard = false;
  // クレジットカード決済対象
  @Input() isCreditCardPayment = true;
  /** DSC以降開始後識別子 */
  @Input() isAfterStartingFrom: boolean = false;
  /** 予約のみ識別子 */
  @Input() isReservationOnly: boolean = false;
  /** 空席待ち予約識別子 */
  private _isWaitlisted: boolean = false;
  @Input()
  set isWaitlisted(value: boolean) {
    this._isWaitlisted = value;
    this.onSelectPaymentMethodCallback();
  }
  get isWaitlisted() {
    return this._isWaitlisted;
  }
  // 支払方法選択エリア表示するかどうか
  @Input() isDisplayPayMethodSelectionArea: boolean = false;
  /** 株主優待情報エリア表示するかどうか */
  @Input() isShowShareholderCouponsArea: boolean = false;
  /** 株主優待情報 */
  @Input() shareholderCoupons?: Array<ShareholderCouponsType>;
  /** レスポンスデータの後日回収型株主優待運賃判定 */
  @Input() isContainedShareholdersBenefitDiscountFareByPostCollection = true;
  /** レスポンスデータの株主優待運賃判定 */
  @Input() isContainedShareholdersBenefitDiscountFare = false;
  // 前画面引継ぎ情報
  @Input() prevScreenInfo: PreviousScreenHandoverInformation = initPreviousScreenHandoverInformation();
  // 会員情報取得処理
  @Output() getMemberInformation = new EventEmitter<Event>();
  // 端末種別ごとの支払方法利用可否判定
  @Output() getAvailabilityPaymentMethod = new EventEmitter<Event>();
  // 画面情報表示処理用
  @Output() displayScreenInformation = new EventEmitter<Event>();
  // ANA SKYコイン利用額再計算用
  @Output() skyCoinAllocationRecaculate = new EventEmitter<Event>();
  // Device ID
  public deviceId: string = '';

  set creditCardInfo(data: PaymentInputCardInfo) {
    this._creditCardInfo = data;
    this._changeDetectorRef.markForCheck();
  }
  get creditCardInfo(): PaymentInputCardInfo {
    return this._creditCardInfo;
  }
  private _creditCardInfo: PaymentInputCardInfo = {};

  set cardHolderInfo(data: PaymentInputCardHolderInfo) {
    this._cardHolderInfo = data;
    this._changeDetectorRef.markForCheck();
  }
  get cardHolderInfo(): PaymentInputCardHolderInfo {
    return this._cardHolderInfo;
  }
  private _cardHolderInfo: PaymentInputCardHolderInfo = {};

  // クレジットカード（領収書の発行名義）
  private _issueReceipt: string = '';
  // ANA SKYコイン情報
  public anaSkyCoinInfo: Array<AnaSkyCoinInfo> = [];
  // ANA SKYコイン利用額
  public usageCoinFormControlList: Array<FormControl> = [];
  // ANA Skyコイン併用選択
  public isAnaSkyCoinCombination: boolean = false;
  // クレジットカード併用選択
  public isCreditCardCombination: boolean = false;
  // 画面出力用運賃ルール
  private _outputFareConditions: OutputFareConditionsPerPtc[] = [];
  // 選択されたカード
  private _selectedCard: RegisteredCardTypeEnum = RegisteredCardTypeEnum.NewCard;
  // カード情報
  private _cardInfo: PaymentInputCardInfo = {};
  //銀行の下チェックボックスの表示/非表示
  public amcBasic: boolean = true;
  public phoneCode: string = '';
  // パスワード認証実施済み判定
  public isPasswordAuthenticationPerformed: boolean = false;
  // Keep My Fare 選択識別子
  public isKeepMyFare: boolean = false;
  // 同意文言エリア設定項目
  public agreementAreaParams: AgreementAreaParts = {
    partsTitle: '',
    isModal: false,
    submitText: '',
  };
  public isDisplayPlanReviewLink: boolean = false;

  // 特典フラグ
  public isAwardBooking: boolean = false;
  // 税金PFC金額
  public totalTax: number = 0;
  // ngif制御用PFC徴収あり
  public hasPFC: boolean = false;

  /** キャッシュ */
  private _masterData: {
    airportCache: { [key: string]: string };
    ffCache: { [key: string]: string };
  } = {
    airportCache: {},
    ffCache: {},
  };

  // 支払い方法データバインディング
  private _paymentMethodsData: PaymentInputPaymentMethodsData = initPaymentInputPaymentMethodsData();
  set paymentMethodsData(value: PaymentInputPaymentMethodsData) {
    this.parts.creditCardParts.cardSelectingParts.selectedPaymentMethod = value.selectedPaymentMethod;
    this.parts = { ...this.parts };
    this._paymentMethodsData = value;
    this.update();
  }
  get paymentMethodsData(): PaymentInputPaymentMethodsData {
    return this._paymentMethodsData;
  }

  // インターネットデータバインディング
  private _internetBankingData: PaymentInputInternetBankingData = initPaymentInputInternetBankingData();
  set internetBankingData(value: PaymentInputInternetBankingData) {
    this._internetBankingData = value;
    this.update();
  }
  get internetBankingData(): PaymentInputInternetBankingData {
    return this._internetBankingData;
  }

  // クレジットカードデータバインディング
  private _creditCardData: PaymentInputRequestCreditCardData = initPaymentInputRequestCreditCardData();
  set creditCardData(value: PaymentInputRequestCreditCardData) {
    this._creditCardData = value;
    this._cardInfo = this._creditCardData.cardInformationData;
    this._selectedCard = this._creditCardData.cardSelectingData.selectedCard;
    this.update();
  }
  get creditCardData(): PaymentInputRequestCreditCardData {
    return this._creditCardData;
  }

  //  sky coinデータバインディング
  private _skyCoinData: PaymentInputSkyCoinData = initPaymentInputSkyCoinData();
  set skyCoinData(value: PaymentInputSkyCoinData) {
    this._skyCoinData = value;
    this._cardInfo = this._skyCoinData.cardInformationData;
    this._selectedCard = this._skyCoinData.cardSelectingData.selectedCard;
    this.update();
  }
  get skyCoinData(): PaymentInputSkyCoinData {
    return this._skyCoinData;
  }

  //  支払金額データバインディング
  private _paymentAmountData: PaymentAmountData = initPaymentAmountData();
  set paymentAmountData(value: PaymentAmountData) {
    this._paymentAmountData = value;
    this.update();
  }
  get paymentAmountData(): PaymentAmountData {
    return this._paymentAmountData;
  }

  get shareholderCouponsFlights(): number {
    return this.shareholderCoupons?.flatMap((bound) => bound.flights).length ?? 0;
  }

  @ViewChild(PaymentInputCreditCardComponent)
  creditCardComponent?: PaymentInputCreditCardComponent;
  @ViewChild(PaymentInputSkyCoinComponent)
  skyCoinComponent?: PaymentInputSkyCoinComponent;
  @ViewChild(PaymentInputInternetBankingComponent)
  internetBankingComponent?: PaymentInputInternetBankingComponent;
  @ViewChild(PaymentInputPaymentMethodsComponent)
  paymentMethodsComponent?: PaymentInputPaymentMethodsComponent;
  @ViewChild(PaymentInputShareholderCouponComponent)
  shareholderCouponComponent!: PaymentInputShareholderCouponComponent;

  public deviceIdFormGroup: FormGroup;

  // paypalの説明欄表示有無
  public isDisplayPaypalDescription: boolean = false;

  // MutationObserverのID保存用
  private mutationObserver?: MutationObserver;

  constructor(
    private _common: CommonLibService,
    private _modalService: ModalService,
    private _errorsHandlerService: ErrorsHandlerService,
    private _getOrderStoreService: GetOrderStoreService,
    private _fareConditionsStoreService: FareConditionsStoreService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _paymentInputStoreService: PaymentInputStoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dialogDisplayService: DialogDisplayService,
    private _aswMasterService: AswMasterService,
    private _staticMsgPipe: StaticMsgPipe,
    private _ticketingService: PaymentInputPresTicketingService,
    private _paymentInputPresService: PaymentInputPresService,
    private _router: Router,
    private _pageLoadingService: PageLoadingService,
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    private _ngZone: NgZone,
    private _dcsDateService: DcsDateService,
    private _loadScriptService: LoadScriptService,
    private _loggerService: LoggerDatadogService
  ) {
    super(_changeDetectorRef, _common);
    this.deviceIdFormGroup = new FormGroup({
      ioBlackBoxFC: new FormControl(''),
    });
    // Reputation Manager Install
    this.reputationManagerInstall();
  }

  /**
   * Reputation Managerのインストール
   */
  reputationManagerInstall() {
    // 実IP情報収集利用フラグ
    const ioEnableRip = this._aswMasterService.getMPropertyByKey(
      'paymentInformationInput',
      'reputationManager.ioEnableRip'
    );
    // Flash8インストール判定フラグ
    const ioInstallFlash = this._aswMasterService.getMPropertyByKey(
      'paymentInformationInput',
      'reputationManager.ioInstallFlash'
    );
    // Active X controlインストール判定フラグ
    const ioInstallStm = this._aswMasterService.getMPropertyByKey(
      'paymentInformationInput',
      'reputationManager.ioInstallStm'
    );
    // ActiveXIE最低ブラウザバージョン
    const ioExcludeStm = this._aswMasterService.getMPropertyByKey(
      'paymentInformationInput',
      'reputationManager.ioExcludeStm'
    );
    // 内部コンテンツ設定
    const _window = window as any;
    _window.io_enable_rip = ioEnableRip;
    _window.io_install_flash = ioInstallFlash;
    _window.io_install_stm = ioInstallStm;
    _window.io_exclude_stm = ioExcludeStm;
    _window.io_bb_callback = (bb: any, complete: any) => {
      if (complete) {
        this.deviceId = bb;
        this._changeDetectorRef.markForCheck();
      }
    };
    // snare.js のURL
    const snareUrl = this._aswMasterService.getMPropertyByKey('paymentInformationInput', 'reputationManager.snareUrl');
    // snare.js インストール
    this._loadScriptService.load$(snareUrl, true).subscribe();
  }
  //画面のサイズを切り替えの設定
  public isSp = isSP();
  public isTb = isTB();
  public isPc = isPC();
  private _isSpPre = isSP();
  private _isTbPre = isTB();
  private _isPcPre = isPC();
  /**
   * 画面のサイズを切り替えの設定
   */
  private resizeEvent = () => {
    this._isSpPre = this.isSp;
    this._isTbPre = this.isTb;
    this._isPcPre = this.isPc;
    this.isSp = isSP();
    this.isTb = isTB();
    this.isPc = isPC();
    if (this._isSpPre !== this.isSp || this._isTbPre !== this.isTb || this._isPcPre !== this.isPc) {
      this.getAvailabilityPaymentMethod.emit();
      this._updateIsDisplayPaymentMethodSelection();
      this._updateSelectedPaymentMethodFormMap();
      this._changeDetectorRef.markForCheck();
    }
  };

  /**
   * SubComponentModelComponent用データ更新イベント
   */
  setPartsEvent() {
    this.refresh();
  }
  setDataEvent() {
    this.refresh();
  }

  /**
   * 画面情報表示処理用
   */
  resetPartsEvent() {
    if (this.creditCardComponent !== undefined) {
      this.creditCardComponent.resetPartsEvent();
    }
    if (this.paymentMethodsComponent !== undefined) {
      this.paymentMethodsComponent?.resetPartsEvent();
    }

    this.refresh();
  }

  refresh() {
    this.deviceIdFormGroup.controls['ioBlackBoxFC'].setValue(this.deviceId);
    this._changeDetectorRef.markForCheck();
  }

  update() {
    this._data = {
      paymentMethodsData: this.paymentMethodsData,
      internetBankingData: this.internetBankingData,
      creditCardData: this.creditCardData,
      skyCoinData: this.skyCoinData,
      paymentAmountData: this.paymentAmountData,
    };
    // 予約のみ識別子を選択したか否かを判断
    this.isReservationOnly = this.data.paymentMethodsData.selectedPaymentMethod === PaymentMethodsType.RESERVATION_ONLY;
    // paypalの説明欄表示の有無判定として、pos国コードがJPか否かを判断
    this.isDisplayPaypalDescription = this._common.aswContextStoreService.aswContextData.posCountryCode === 'JP';
    this.dataChange.emit(this._data);
  }

  reload(): void {}

  init(): void {
    this.phoneCountryInfoList = this._paymentInputPresService.removeDuplicates(
      this.phoneCountryInfoList,
      (a, b) => a.countryName === b.countryName
    );
    this.availableBankList = this._paymentInputPresService.removeDuplicates(
      this.availableBankList,
      (a, b) => a.bank_code === b.bank_code
    );
    //画面のサイズを切り替えの設定
    this.subscribeService(
      'paymentInputPres_subHeaderResize',
      fromEvent(window, 'resize').pipe(throttleTime(500)),
      this.resizeEvent
    );
    //代表者電話番号国を初期選択する
    this.phoneCode = this.screenEntry.creditCardInformation.countryNumber;
    this.cardHolderInfo = {
      email: this.screenEntry.creditCardInformation.mailAddress,
      phone: {
        countryPhoneCode: this.screenEntry.creditCardInformation.phoneCountry,
        countryPhoneExtension: this.screenEntry.creditCardInformation.countryNumber,
        number: this.screenEntry.creditCardInformation.phoneNumber,
      },
    };

    this.subscribeService(
      'paymentAmountAreaCartInfoSubscription',
      this._currentCartStoreService.getCurrentCart$(),
      (value) => {
        this.isDisplayPlanReviewLink = !!value.data?.cartId;
      }
    );

    // 同意文言エリア設定項目取得
    this.forkJoinService(
      'paymentInputPres_setAgreementAreaParams',
      [this._staticMsgPipe.get('heading.agreement'), this._staticMsgPipe.get('label.purchaseButton')],
      ([str1, str2]) => {
        this.agreementAreaParams = {
          ...this.agreementAreaParams,
          partsTitle: str1,
          submitText: str2,
        };
        this._changeDetectorRef.markForCheck();
      }
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pnrInfo'] && this.pnrInfo) {
      // 特典フラグ取得
      this.isAwardBooking = Boolean(this.pnrInfo?.orderType?.isAwardBooking);
      // 税金取得
      const ticketPrices = this.pnrInfo?.prices?.totalPrices?.ticketPrices;
      this.totalTax = ticketPrices?.totalTaxes?.[0]?.value ?? 0;

      // 特典かつ徴収ありの場合
      this.hasPFC = this.totalTax > 0;
    }
  }

  destroy(): void {
    // MutationObserverが起動していれば破棄
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  ngAfterViewInit(): void {
    // jsのonclickイベントから呼ぶメソッドの定義をwindowオブジェクトに格納する
    (window as any)['PaymentTermsFunction'] = {
      callFunction: (event?: Event) => this.openPaymentTerms(event),
    };

    (window as any)['MiniRuleFunction'] = {
      callFunction: (event?: Event) => this.openMiniRule(event),
    };

    // 同意エリア取得
    const agreementArea = this._elementRef.nativeElement.querySelector('asw-agreement-area');

    if (agreementArea) {
      //　MutationObserverのコールバック関数をセット
      this.mutationObserver = new MutationObserver(() => this.addFunctionToDynamicMessage());

      // MutationObserverを起動して、DOMの変更を監視する
      this.mutationObserver.observe(agreementArea, { childList: true, subtree: true, characterData: true });
    }
  }

  /**
   * 動的文言内の指定IDを持つタグにイベントを設定する
   */
  addFunctionToDynamicMessage(): void {
    // 同意エリア取得
    const agreementArea = this._elementRef.nativeElement.querySelector('asw-agreement-area');

    if (agreementArea) {
      // aタグ取得
      const aTags = agreementArea.querySelectorAll('a') as HTMLAnchorElement[];

      // IDがopenPaymentTerms、またはopenMiniRuleの場合に特定のイベントを埋め込む
      Array.from(aTags)
        .filter((a: HTMLAnchorElement) => a.id === 'openPaymentTerms' || a.id === 'openMiniRule' || a.id === 'ruleText')
        .forEach((a: HTMLAnchorElement) => {
          // u-payment-input-hyperlink-textのスタイルが設定されていない場合
          if (!a.classList.contains('u-payment-input-hyperlink-text')) {
            // aタグにイベントを設定する
            this._renderer.setAttribute(
              a,
              'onclick',
              a.id === 'openPaymentTerms' || a.id === 'ruleText'
                ? 'window.PaymentTermsFunction.callFunction(event)'
                : 'window.MiniRuleFunction.callFunction(event)'
            );
            // 見た目上リンクにするためクラスを付与
            a.classList.add('u-payment-input-hyperlink-text');
          }
        });
      this._changeDetectorRef.detectChanges();
    }
  }

  /**
   * ウェルネットの決済情報
   */
  wellnetpayment() {
    this.amcBasic =
      this.wellnetBankList.find((bank) => bank.bank_code === this.data.internetBankingData.bankCode)
        ?.amc_basic_payment_method_flag ?? false;
  }

  /**
   * 利用可能な支払方法より選択支払方法を更新
   */
  private _updateSelectedPaymentMethodFormMap() {
    if (!this.paymentMethod.get(this._data.paymentMethodsData.selectedPaymentMethod)) {
      let firstAvailableMethod = '';
      for (let [key, value] of this.paymentMethod.entries()) {
        if (value) {
          firstAvailableMethod = key as string;
          break;
        }
      }
      this.paymentMethodsComponent?.handleStore(firstAvailableMethod);
    }
  }

  /**
   * ANA SKYコイン　最新残高に更新のクリックイベント
   */
  updateAnaSkyCoinBalance() {
    // 会員情報残高更新情報API呼び出し
    this._paymentInputPresService.invokeRefreshAmcmemberBalanceApi(
      (response) => {
        // SKYコインの表示を更新
        this.data.skyCoinData.skyCoinBallancesData.skyCoinBalance = response.data?.skyCoinBalance ?? 0;
        this.data.skyCoinData.skyCoinBallancesData.mileBalance = response.data?.mileBalance ?? 0;
        this.parts.skyCoinParts.skyCoinBallancesParts.skyCoinBalance = response.data?.skyCoinBalance ?? 0;
        this.parts.skyCoinParts.skyCoinBallancesParts.mileBalance = response.data?.mileBalance ?? 0;
        this.skyCoinComponent?.skyCoinBallancesComponent?.setPartsEvent();

        // クレジットカードの表示を更新
        this.data.creditCardData.skyCoinBallancesData.skyCoinBalance = response.data?.skyCoinBalance ?? 0;
        this.data.creditCardData.skyCoinBallancesData.mileBalance = response.data?.mileBalance ?? 0;
        this.parts.creditCardParts.skyCoinBallancesParts.skyCoinBalance = response.data?.skyCoinBalance ?? 0;
        this.parts.creditCardParts.skyCoinBallancesParts.mileBalance = response.data?.mileBalance ?? 0;
        this.creditCardComponent?.skyCoinBallancesComponent?.setPartsEvent();
        timer(0).subscribe(() => {
          this.skyCoinAllocationRecaculate.emit();
          this.skyCoinComponent?.skyCoinUsageComponent?.setPartsEvent();
        });
      },
      (error) => {
        // 処理を中断する
        this._errorsHandlerService.setNotRetryableError({
          errorType: ErrorType.BUSINESS_LOGIC, // ビジネスロジックエラー
          apiErrorCode: this._common.apiError?.['errors']?.[0].code, // APIエラーレスポンス情報
        });
      }
    );
  }

  /**
   * SKYコインコンポーネント用 ANA SKYコイン利用額更新イベント（支払内訳を更新）
   */
  public updateAnaSkyCoinSummarySkyCoin() {
    this.skyCoinComponent?.SkyCoinSummaryComponent?.setPartsEvent();
  }

  /**
   * クレジットカードコンポーネント用 ANA SKYコイン利用額更新イベント（支払内訳を更新）
   */
  public updateAnaSkyCoinSummaryCreditCard() {
    this.creditCardComponent?.SkyCoinSummaryComponent?.setPartsEvent();
  }

  /**
   *  支払情報詳細モーダル呼び出し
   */
  paymentDetails(paymentDetailsData?: PaymentDetailsData) {
    const paymentInputInfo = { ...this._paymentInputStoreService.paymentInputData };
    this._paymentInputStoreService.setPaymentInput(paymentInputInfo);
    const part = defaultPaymentDetailsModalParts();
    part.payload = {
      totalMileage: paymentDetailsData?.totalMileage ?? 0,
      paxMileage: paymentDetailsData?.paxMileage ?? 0,
      isAwardBooking: paymentDetailsData?.isAwardBooking ?? false,
      ...paymentInputInfo,
    } as PaymentDetailsPayload;
    // モーダル表示
    this._modalService.showSubModal(part);
  }

  /**
   * AAMプロモーションコード入力モーダル呼び出し
   */
  usePromotionCode() {
    // モーダル呼び出しパラメータの設定
    const part = useCouponsPayloadParts(this.prevScreenInfo);
    // モーダルを閉じた後の処理を設定
    part.closeEvent = () => this.usePromotionCodePostProcessing();
    // モーダル表示
    this._modalService.showSubModal(part);
  }

  /**
   * AAMプロモーションコード入力モーダルを閉じた後の処理
   */
  usePromotionCodePostProcessing() {
    const isError = this._paymentInputStoreService.getPaymentInput$();
    let errflg: boolean = false;
    this._pageLoadingService.startLoading();
    this.addSubscription(
      'IndividualCheck_Subscription',
      isError.subscribe((value) => {
        this._pageLoadingService.endLoading();
        if (value.promotionCodeErrorId) {
          this._errorsHandlerService.setRetryableError(PageType.PAGE, { errorMsgId: value.promotionCodeErrorId });
        } else if (value.isChangePromotionCode) {
          this.deleteSubscription('IndividualCheck_Subscription');
          this.displayScreenInformation.emit();
        }
      })
    );
  }

  /**
   *  AAMプロモーションコード適用解除処理
   */
  cancelPromotionCode() {
    // 確認ダイアログ
    this._dialogDisplayService.openDialog({ message: 'm_dynamic_message-MSG1051' }).buttonClick$.subscribe((result) => {
      if (result.clickType === DialogClickType.CONFIRM) {
        this._pageLoadingService.startLoading();
        const ordersRepriceOrderRequestParam = this._paymentInputPresService.generateOrdersRepriceApiParam(
          this.prevScreenInfo
        );

        // 購入時運賃再計算API実行
        this._paymentInputPresService.invokeOrdersRepriceApi(
          ordersRepriceOrderRequestParam,
          (response) => {
            this._pageLoadingService.endLoading();
            const paymentInputInfo = { ...this._paymentInputStoreService.paymentInputData };
            paymentInputInfo.isChangePromotionCode = true;
            this._paymentInputStoreService.updatePaymentInput(paymentInputInfo);
            this.displayScreenInformation.emit();
          },
          (error) => {
            this._pageLoadingService.endLoading();
            // APIレスポンスが不合格の場合継続不可能エラー
            const errorCode = this._common.apiError?.errors?.[0].code;
            let errMsgId = '';
            switch (errorCode) {
              case ErrorCodeConstants.ERROR_CODES.EBAZ000201: // PNRが発券期限切れであった場合
                errMsgId = 'E0564'; // 発券期限切れの旨
                break;
              case ErrorCodeConstants.ERROR_CODES.EBAZ000202: // 購入対象のPNRが購入不可PNRであった場合
                errMsgId = 'E0754'; // 購入不可PNRである旨
                break;
              default:
                break;
            }
            this._errorsHandlerService.setNotRetryableError({
              errorType: ErrorType.BUSINESS_LOGIC, // ビジネスロジックエラー
              errorMsgId: errMsgId, // エラーメッセージID
              apiErrorCode: errorCode, // APIエラーレスポンス情報
            });
          }
        );
      }
    });
  }

  /**
   * 同意ボタンのクリック処理
   */
  clickAgree() {
    // 1.個別入力チェックでエラーがあれば処理終了
    // 2.ANA SKYコイン支払のクレジットカード情報
    if (!this.isValid()) return;

    // 3.確認ダイアログ表示
    const msgId = this._paymentInputPresService.paymentConfirmation(
      this.isKeepMyFare,
      this.isCreditCardCombination,
      this.data.paymentMethodsData.selectedPaymentMethod,
      this.isWaitlisted
    );

    if (!msgId) {
      // msgId未設定する場合は確認ダイアログは表示せずに購入処理を継続する
      this.continuePaymentProcess();
      return;
    }

    //ダイアログ情報："MSG1044"(同意書への記入が必要である旨)
    const dialogInfo: DialogInfo = {
      type: DialogType.CHOICE, //ダイアログタイプ
      message: 'm_dynamic_message-' + msgId, //ダイアログのメッセージID
    };
    this.subscribeService(
      'PaymentInputPresComponent_toBookingComplete',
      this._dialogDisplayService.openDialog(dialogInfo).buttonClick$,
      (result) => {
        this.deleteSubscription('PaymentInputPresComponent_toBookingComplete');

        if (result.clickType === DialogClickType.CONFIRM) {
          this.continuePaymentProcess();
        }
      }
    );
  }

  /**
   * 購入処理を継続する
   */
  private continuePaymentProcess() {
    // 支払い方法にクレジットカードが含まれているかどうか判定
    const isCreditCardPayment = this._paymentInputPresService.isCreditCard(
      this.isCreditCardCombination,
      this.data.paymentMethodsData.selectedPaymentMethod as PaymentMethodsType
    );
    if (!this.deviceId && isCreditCardPayment) {
      // snare.js のURL
      const snareUrl = this._aswMasterService.getMPropertyByKey(
        'paymentInformationInput',
        'reputationManager.snareUrl'
      );
      // snare.js インストール
      this._loadScriptService.load$(snareUrl, true).subscribe((loadSuccess) => {
        if (!loadSuccess) {
          this._loggerService.error(LogType.PAGE_VIEW, { errMsg: 'snare.js load error!' });
        }
        if (!this.deviceId) {
          this._loggerService.error(LogType.PAGE_VIEW, {
            errMsg: `snare.js get deviceId error ${(window as any).io_last_error}`,
          });
          this._errorsHandlerService.setNotRetryableError({
            errorType: ErrorType.BUSINESS_LOGIC,
            errorMsgId: 'E1861',
          });
        } else {
          this._executePaymentRecords();
        }
      });
    } else {
      this._executePaymentRecords();
    }
  }

  /** 購入・発券処理 */
  private _executePaymentRecords() {
    this._ticketingService.executePaymentRecords(
      {
        isKeepMyFare: this.isKeepMyFare,
        selectedPaymentMethod: this.data.paymentMethodsData.selectedPaymentMethod as PaymentMethodsType,
        selectedCard: this._selectedCard,
        totalUseCoin: this.totalUseCoin,
        bankCode: this.data.internetBankingData.bankCode,
        issueReceipt: this._issueReceipt,
        isCreditCardCombination: this.isCreditCardCombination,
        isSaveAsUsualChecked: this.data.paymentMethodsData.isSaveAsUsualChecked,
        isBankSaveAsUsualChecked: this.internetBankingData.isSaveAsUsualChecked,
        cardInfo: this._cardInfo,
        holderInfo: this.cardHolderInfo,
        prevScreenInfo: this.prevScreenInfo,
        isReservationOnly: this.isReservationOnly,
        isWaitlisted: this.isWaitlisted,
        shareholderCoupons: this.isReservationOnly ? [] : this.shareholderCoupons,
        isContainedShareholdersBenefitDiscountFare:
          this.pnrInfo?.air?.isContainedShareholdersBenefitDiscountFare ?? false,
      },
      this.deviceId
    );
  }

  /**
   * 個別入力チェック処理
   */
  isValid(): boolean {
    // 支払方法の更新
    this.paymentMethodsComponent?.update();
    // クレジットカード決済判定を更新("支払方法がクレカ"か"支払方法がSKYコインでクレカ併用"のときtrue)
    this.isCreditCardPayment =
      (this.data.paymentMethodsData.selectedPaymentMethod === PaymentMethodsType.ANA_SKY_COIN &&
        this.isCreditCardCombination) ||
      this.data.paymentMethodsData.selectedPaymentMethod === PaymentMethodsType.CREDIT_CARD;

    // 株主優待券エリアの入力チェック
    let isValidShareholder: Boolean = true;
    if (this.shareholderCouponComponent && !this.shareholderCouponComponent.runValidation()) {
      isValidShareholder = false;
    }

    // クレカ、領収書宛名が表示されるか
    const isReceiptDisp = this._common.aswContextStoreService.aswContextData.posCountryCode === 'JP';
    // 支払方法ごとのバリデーションチェック
    if (this.data.paymentMethodsData.selectedPaymentMethod === PaymentMethodsType.CREDIT_CARD) {
      // バリデーション実行（CD)
      this.creditCardComponent?.runValidation();
      const isValidCardInfo = this.creditCardData.cardInformationData.validation;
      const isValidCardHolderInfo = this.creditCardData.cardHolderInfoData.validation;
      const isValidCreditCardReceipt = !isReceiptDisp || this.creditCardData.creditCardReceiptData.validation;

      //クレジットカード、カード情報と名義人情報のバリデーション結果確認
      if (isValidCardInfo && isValidCardHolderInfo && isValidShareholder && isValidCreditCardReceipt) {
        // dataの値を更新用変数に設定する
        // クレジットカード情報
        this.creditCardInfo.uatpCard = this.data.creditCardData.cardInformationData.uatpCard;
        this.creditCardInfo.cardNumber = this.data.creditCardData.cardInformationData.cardNumber;
        this.creditCardInfo.cardExpiryDate = this.data.creditCardData.cardInformationData.cardExpiryDate;
        this.creditCardInfo.cvv = this.data.creditCardData.cardInformationData.cvv;
        this.creditCardInfo.ownerName = this.data.creditCardData.cardInformationData.ownerName;
        this.creditCardInfo.reservation = this.data.creditCardData.cardInformationData.reservation;
        // クレジットカード名義人
        this.cardHolderInfo.email = this.data.creditCardData.cardHolderInfoData.email;
        this.cardHolderInfo.phone!.number = this.data.creditCardData.cardHolderInfoData.phoneNumber;
        this.cardHolderInfo.phone!.countryPhoneCode = this.data.creditCardData.cardHolderInfoData.countryCode;
        this.cardHolderInfo.phone!.countryPhoneExtension = this.data.creditCardData.cardHolderInfoData.countryNumber;
        // クレジットカード（領収書の発行名義）
        this._issueReceipt = this.data.creditCardData.creditCardReceiptData.issueReceipt;
        return true;
      }
    } else if (
      this.data.paymentMethodsData.selectedPaymentMethod === PaymentMethodsType.CONVENIENCE_STORE ||
      this.data.paymentMethodsData.selectedPaymentMethod === PaymentMethodsType.RESERVATION_ONLY ||
      this.data.paymentMethodsData.selectedPaymentMethod === PaymentMethodsType.PAY_EASY ||
      this.isWaitlisted
    ) {
      this.totalUseCoin = 0;
      return true;
    }

    //特典かつ支払金額が０円の場合購入するボダン押下し、次の画面へ遷移が可能
    if (this.isAwardBooking && !this.hasPFC) {
      return true;
    }

    //エラーメッセージ表示
    this._errorsHandlerService.setRetryableError(PageType.PAGE);
    return false;
  }

  // お支払い方法を選択された処理
  onSelectPaymentMethodCallback() {
    this.agreementAreaParams = {
      ...this.agreementAreaParams,
      submitText: this._staticMsgPipe.transform(this.switchAgressBtnStr()),
    };
    this._changeDetectorRef.markForCheck();
  }

  /**
   * 購入ボタンの文言を切り替え
   * 文言キーを返答する
   * @returns 文言キー
   */
  switchAgressBtnStr(): string {
    // Keep My Fare選択識別子=true
    if (this.isKeepMyFare) {
      return 'label.bookingFlight';
    }

    // 予約のみ識別子=true
    if (this.isReservationOnly) {
      return 'label.bookFlights';
    }

    // 空席待ち予約識別子=true
    if (this.isWaitlisted) {
      return 'label.waitinglist';
    }
    // 上記以外
    return 'label.purchaseButton';
  }

  /**
   * Keep My Fare選択 トグルスイッチ処理
   */
  kmfToggle() {
    this.isKeepMyFare = !this.isKeepMyFare;
    // 支払方法選択エリア表示可否判定変数アップデート
    this._updateIsDisplayPaymentMethodSelection();

    // 同意文言エリア設定項目
    this.isKeepMyFare
      ? (this.agreementAreaParams = {
          ...this.agreementAreaParams,
          submitText: this._staticMsgPipe.transform('label.bookingFlight'),
        })
      : (this.agreementAreaParams = {
          ...this.agreementAreaParams,
          submitText: this._staticMsgPipe.transform('label.purchaseButton'),
        });

    // 選択支払方法変更処理
    this.isKeepMyFare
      ? this.paymentMethodsComponent?.handleStore('CD')
      : this.paymentMethodsComponent?.handleStore(this.screenEntry.prevPaymentMethod);

    // 動的文言
    const paymentInputDynamicParams = {
      ...dynamicSubject.getValue(),
      pageContext: {
        ...dynamicSubject.getValue().pageContext,
        isKeepMyFare: this.isKeepMyFare,
      },
    };
    dynamicSubject.next(paymentInputDynamicParams);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * 支払方法選択エリア表示可否判定変数アップデート
   */
  private _updateIsDisplayPaymentMethodSelection() {
    if (this.isKeepMyFare) {
      this.isDisplayPaymentMethodSelection = false;
    } else {
      let counter = 0;
      this.paymentMethod.forEach((value, key) => {
        if (value && key != PaymentMethodsType.KEEP_MY_FARE) counter++;
      });
      counter > 1 ? (this.isDisplayPaymentMethodSelection = true) : (this.isDisplayPaymentMethodSelection = false);
    }
  }

  /**
   * ANA Skyコイン併用選択 トグルスイッチ処理
   */
  skyCoinToggle() {
    this.isAnaSkyCoinCombination = !this.isAnaSkyCoinCombination;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * クレジットカード併用選択 トグルスイッチ処理
   */
  creditCardToggle() {
    this.isCreditCardCombination = !this.isCreditCardCombination;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * 銀行名が変わったらそれに合わせたチェックボックスの表示/非表示します。
   */
  public bankChangeEvent(value: string) {
    this.availableBankList.forEach((selectBank: MBankWellnet) => {
      if (selectBank.bank_code === value) {
        this.wellnetpayment();
      }
    });
  }

  /**
   * 支払規約リンク押下処理
   * @param event エレメントのイベント情報
   */
  public openPaymentTerms(event?: Event) {
    //イベントが渡された場合、preventDefaultで遷移処理を中止する
    if (event) {
      event.preventDefault();
    }
    // メッセージキーを作成
    const messageKey: string = `label.paymentTerms.details.${this.data.paymentMethodsData.selectedPaymentMethod}`;

    // Pos付きでメッセージを取得
    let message = this._staticMsgPipe.transform(
      `${messageKey}.${this._common.aswContextStoreService.aswContextData.posCountryCode}`
    );

    // 取得できてない場合(キーが変換できていない)
    if (message.includes(messageKey)) {
      // posなしで取得
      message = this._staticMsgPipe.transform(`${messageKey}`);
    }

    // モーダル呼び出しパラメータの設定
    const part = paymentTermsModalParts();
    part.payload = { message };
    // モーダル表示
    this._ngZone.run(() => this._modalService.showSubModal(part));
  }

  /**
   * 運賃詳細モーダル表示処理
   * @param event エレメントのイベント情報
   */
  openMiniRule(event?: Event): void {
    //イベントが渡された場合、preventDefaultで遷移処理を中止する
    if (event) {
      event.preventDefault();
    }

    const lang = this._common.aswContextStoreService.aswContextData.lang;
    this.subscribeService(
      'paymentInputPresComponent GetMasterDataAll',
      this._aswMasterService
        .load(
          [
            {
              key: MasterStoreKey.M_AIRPORT_I18N + `_${lang}`,
              fileName: 'm_airport_i18n' + '/' + lang,
            },
            {
              key: MasterStoreKey.M_FF_PRIORITY_CODE_I18N + `_${lang}`,
              fileName: 'm_ff_priority_code_i18n' + '/' + lang,
            },
          ],
          true
        )
        .pipe(
          filter((data) => !!data),
          first()
        ),
      (data) => {
        this.deleteSubscription('PlanReviewFareConditionsComponent GetMasterDataAll');
        [this._masterData.airportCache, this._masterData.ffCache] = data;
        this.setfareConditionDetailsDataAndShow();
      }
    );
  }

  /**
   * 外部出力用データ作成処理
   * paymentInputPresComponent GetMasterDataAllのデータに依存
   */
  setfareConditionDetailsDataAndShow() {
    const airOfferConditions = this._fareConditionsStoreService.fareConditionsData.data.airOfferConditions;
    const bounds = airOfferConditions?.airOfferConditionBounds;
    const pnrInfo = this._getOrderStoreService.getOrderData.data;
    const ptcList: [string, FareConditionsResponseDataAirOfferConditionsPtc][] = Object.entries(
      airOfferConditions ?? {}
    ).filter(([key]) => key !== 'airOfferConditionBounds');
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    this.subscribeService(
      'PymentInputPresComponent GetFareConditions',
      this._aswMasterService.load(getFareConditionsMasterKey(lang), true),
      (data) => {
        this.deleteSubscription('PymentInputPresComponent GetFareConditions');
        [this._masterData.airportCache, this._masterData.ffCache] = data;
        // 画面出力用運賃ルール情報を作成
        this._outputFareConditions = ptcList.map(([ptc, ptcInfo]) => {
          const paxBounds =
            bounds?.map((b, i) => {
              return {
                depLoc:
                  getAirportNameFromCache(b.originLocationCode ?? '', this._masterData.airportCache) ??
                  b.originLocationName,
                arrLoc:
                  getAirportNameFromCache(b.destinationLocationCode ?? '', this._masterData.airportCache) ??
                  b.destinationLocationName,
                fareFamilyName: this._masterData.ffCache['m_ff_priority_code_i18n_' + b.priorityCode] ?? '',
                fareBasis: b.fareBasis ?? '',
                promo:
                  this.appliedDiscountType === 'CAT25'
                    ? pnrInfo?.prices?.totalPrices?.discount?.cat25DiscountName
                    : this.appliedDiscountType === 'AAM'
                    ? pnrInfo?.prices?.totalPrices?.discount?.aamDiscountCode
                    : '',
                changeConditions: {
                  beforeDeparture: ptcInfo?.changeConditions?.[i]?.beforeDeparture.defaultDescription ?? '',
                  beforeDepartureNoShow: ptcInfo?.changeConditions?.[i]?.beforeDepartureNoShow.defaultDescription ?? '',
                  afterDeparture: ptcInfo?.changeConditions?.[i]?.afterDeparture.defaultDescription ?? '',
                  afterDepartureNoShow: ptcInfo?.changeConditions?.[i]?.afterDepartureNoShow.defaultDescription ?? '',
                },
                refundConditions: {
                  beforeDeparture: ptcInfo?.refundConditions?.[i]?.beforeDeparture.defaultDescription ?? '',
                  beforeDepartureNoShow: ptcInfo?.refundConditions?.[i]?.beforeDepartureNoShow.defaultDescription ?? '',
                  afterDeparture: ptcInfo?.refundConditions?.[i]?.afterDeparture.defaultDescription ?? '',
                  afterDepartureNoShow: ptcInfo?.refundConditions?.[i]?.afterDepartureNoShow.defaultDescription ?? '',
                },
                minStays: ptcInfo?.minimumStays?.[i] ?? '',
                maxStays: ptcInfo?.maximumStays?.[i] ?? '',
                isDomesticAfterDcs:
                  this.pnrInfo?.air?.tripType === 'domestic' &&
                  this._dcsDateService.isAfterDcs(this.pnrInfo?.air?.bounds?.[0]?.originDepartureDateTime ?? '') &&
                  this._common.aswContextStoreService.aswContextData.posCountryCode === 'JP',
              };
            }) ?? [];
          return {
            ptc: ptc,
            bounds: paxBounds,
          };
        });
        const fareConditionDetailsData = this.convertPerPtcToPerBound(this._outputFareConditions);
        this.showGetfareConditionDetailsModal(fareConditionDetailsData);
      }
    );
  }

  /**
   * 運賃ルール詳細モーダル表示処理
   * @param data 運賃ルール詳細モーダル表示用データ
   */
  showGetfareConditionDetailsModal(data: OutputFareConditionsPerBound[]) {
    const part = fareConditionDetailsModalParts();
    part.payload = { data: data };
    this._ngZone.run(() => this._modalService.showSubModal(part));
  }

  /**
   * 運賃ルールパーツ用の出力情報を運賃ルール詳細モーダル用に組み替える処理
   * @param conds
   * @returns
   */
  convertPerPtcToPerBound(conds: OutputFareConditionsPerPtc[]): OutputFareConditionsPerBound[] {
    const bounds = conds[0].bounds.map((bound) => ({ depLoc: bound.depLoc, arrLoc: bound.arrLoc }));
    return bounds.map((bound, i) => {
      const condsPerPtc = conds.map((e) => ({
        ptc: e.ptc,
        fareFamilyName: e.bounds[i].fareFamilyName,
        fareBasis: e.bounds[i].fareBasis,
        promo: e.bounds[i].promo,
        changeConditions: e.bounds[i].changeConditions,
        refundConditions: e.bounds[i].refundConditions,
        minStays: e.bounds[i].minStays,
        maxStays: e.bounds[i].maxStays,
        isDomesticAfterDcs: e.bounds[i]?.isDomesticAfterDcs,
      }));
      return {
        depLoc: bound.depLoc,
        arrLoc: bound.arrLoc,
        condsPerPtc: condsPerPtc,
      };
    });
  }

  /**
   *
   * @param traveler
   * @param flight
   */
  public modifyShareholderCoupon(traveler: Partial<TravelerType>, flight: FlightType) {
    const index = flight.travelers.findIndex((o) => o.travelerId === traveler.travelerId);
    if (index !== -1) {
      flight.travelers.splice(index, 1, {
        ...flight.travelers[index],
        ...traveler,
      });
    }
  }
  /**
   * プラン確認画面に戻る
   */
  clickPrevPlanInfo() {
    // 支払情報入力画面取得情報破棄処理
    this._paymentInputStoreService.paymentInputInformationDiscard();
    // プラン確認画面に戻る
    this._router.navigateByUrl(RoutesResRoutes.PLAN_REVIEW);
  }

  /**
   * E1854表示判定処理
   * SKYコイン＋クレジットカード利用PAXがいるかつ他にもSKYコイン利用のPAXがいる場合にエラーを表示する
   * @param data AnaSkyCoinInfo[] ANA SKYコイン情報
   * @returns boolean 判定結果 true:メッセージ表示  false:後続処理へ
   */
  private _checkSkycoinAndCreditCardMix(data: AnaSkyCoinInfo[]): boolean {
    let fullUse = 0; // SKYコインもしくはクレジットカード全額支払PAX数
    let coinUse = 0; // SKYコイン利用PAX数
    for (const checkAnaSkyCoinInfo of data) {
      const calUsageCoin = checkAnaSkyCoinInfo.usageCoin ?? 0 > 0; // 判定のために定義する
      // 利用額が0より大きい場合は利用あり かつ SKYコイン利用(SKYコイン全額利用) または　SKYコイン未使用(全額クレジットカード)
      if (
        (Number(calUsageCoin) > 0 && checkAnaSkyCoinInfo.ticketPrice === calUsageCoin) ||
        Number(calUsageCoin) === 0
      ) {
        fullUse += 1;
      }
      if (Number(calUsageCoin) > 0) {
        coinUse += 1;
      }
    }
    // PAXが複数かつ（全額支払のPAX数とPAXの総数が一致しないかつSKYコイン利用が複数）
    if (data.length > 1 && fullUse !== data.length && coinUse > 1) {
      //エラーメッセージ表示
      this._errorsHandlerService.setRetryableError(PageType.PAGE, { errorMsgId: 'E1854' });
      return true;
    }
    return false;
  }
}
