import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ElementRef,
  Renderer2,
  NgZone,
} from '@angular/core';
import { Router } from '@angular/router';
import { PreviousScreenHandoverInformation, PaymentInputInitMOffice } from '../../payment-input';
import { PaymentInputPresService } from '../../payment-input/presenter/payment-input-pres.service';
import { getFareConditionsMasterKey } from '../../payment-input/presenter/payment-input-pres.state';
import { PaymentDetailsPayload } from '../../payment-input/sub-components/modal/payment-details/payment-details.state';
import { defaultPaymentDetailsModalParts } from '../../payment-input/sub-components/modal/payment-details/payment-details.state';
import { paymentTermsModalParts } from '../../payment-input/sub-components/modal/payment-terms/payment-terms.state';
import { useCouponsPayloadParts } from '../../payment-input/sub-components/modal/use-coupons/use-coupons-payload.state';
import { PaymentInputCardInfoService } from '../../payment-input/sub-components/payment-input-common/payment-input-card-info/payment-input-card-info.service';
import { fareConditionDetailsModalParts } from '@common/components/reservation/plan-review/fare-condition-details/fare-condition-details.state';
import { getAirportNameFromCache, defaultApiErrorEvent } from '@common/helper';
import { CountryCodeNameType, FlightType, ShareholderCouponsType, TravelerType } from '@common/interfaces';
import { PaymentMethodsType } from '@common/interfaces/common/payment-methods';
import { MCountry } from '@common/interfaces/master/m_country';
import { OutputFareConditionsPerBound } from '@common/interfaces/reservation/plan-review/output-fare-conditions-per-bound.interface';
import { OutputFareConditionsPerPtc } from '@common/interfaces/reservation/plan-review/output-fare-conditions-per-ptc.interface';
import {
  CurrentCartStoreService,
  FareConditionsStoreService,
  GetOrderStoreService,
  LocalDateService,
  PaymentInputStoreService,
  DcsDateService,
} from '@common/services';
import { MasterStoreKey } from '@conf/asw-master.config';
import { RoutesResRoutes } from '@conf/routes.config';
import { AgreementAreaParts } from '@lib/components';
import { SupportComponent } from '@lib/components/support-class';
import { DialogClickType, DialogInfo, DialogType, ErrorType, LogType, PageType, MOffice } from '@lib/interfaces';
import { StaticMsgPipe } from '@lib/pipes';
import {
  AswMasterService,
  CommonLibService,
  DialogDisplayService,
  ErrorsHandlerService,
  LoadScriptService,
  LoggerDatadogService,
  ModalService,
  PageLoadingService,
} from '@lib/services';
import { filter, first, fromEvent, throttleTime, BehaviorSubject } from 'rxjs';

import { isSP, isTB, isPC } from 'src/lib/helpers';
import { OrdersAnaBizSendBackTicketingRequestRequest, OrdersRepriceOrderRequest } from 'src/sdk-reservation';
import { GetOrderResponseData } from 'src/sdk-servicing';
import { FareConditionsResponseDataAirOfferConditionsPtc } from 'src/sdk-servicing/model/fareConditionsResponseDataAirOfferConditionsPtc';
import {
  AnabizBasicCardInfo,
  AnabizCreditCardInformation,
  AnabizCardHolderInfo,
  initAnabizCreditCardInformation,
  initAnabizCardHolderInfo,
} from '../container/anabiz-payment-input-cont.state';
import { AnabizPaymentInputCardHolderComponent } from '../sub-components/anabiz-payment-input-card-holder/anabiz-payment-input-card-holder.component';
import { AnabizPaymentInputCardInfoComponent } from '../sub-components/anabiz-payment-input-card-info/anabiz-payment-input-card-info.component';
import { AnabizPaymentInputPresService } from './anabiz-payment-input-pres.service';
import { InvokeGetCreditPanInformationApiErrorMap } from './anabiz-payment-input-pres.state';
import { PaymentInputShareholderCouponComponent } from '../../payment-input/sub-components/payment-input-shareholder-coupon/payment-input-shareholder-coupon.component';
import { ErrorCodeConstants } from '@conf/app.constants';
@Component({
  selector: 'asw-anabiz-payment-input-pres',
  templateUrl: './anabiz-payment-input-pres.component.html',
  styleUrls: ['./anabiz-payment-input-pres.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnabizPaymentInputPresComponent extends SupportComponent {
  // PNR情報
  @Input() pnrInfo: GetOrderResponseData | undefined = {};
  // プロモーション種別
  @Input() appliedDiscountType: string = '';
  // プロモーションコード変更判定
  @Input() isChangePromotionCode: boolean = false;
  // プロモーションコード適用判定
  @Input() isApplicableDiscountCode: boolean = false;
  // 予約のみ識別子
  @Input() isReserveOnly: boolean = false;
  // クレジットカード決済対象判定
  @Input() isCreditCardPayment: boolean = false;
  // 承認者ID
  @Input() approverId: string = '';
  // 出張者識別子
  @Input() isTraveler: boolean = false;
  // 予約のみが選択可能識別子
  @Input() isOnholdEligible: boolean = false;

  @Input() currentOfficeInfo: MOffice = PaymentInputInitMOffice();

  @Input() issueFlag: string = '';

  /** 国.国コード(2レター) 国(国際化).国名称 */
  @Input() phoneCountryInfoList: Array<CountryCodeNameType> = [];

  @Input() isWaitlisted: boolean = false;
  @Input() countryAll: Array<MCountry> = [];

  //新規フロー識別子
  public hasCartId: boolean = false;

  /** 株主優待情報エリア表示可否 */
  @Input() isShowShareholderCouponsArea: boolean = false;
  /** 株主優待情報 */
  @Input() shareholderCoupons?: Array<ShareholderCouponsType>;
  /** レスポンスデータの後日回収型株主優待運賃判定 */
  @Input() isContainedShareholdersBenefitDiscountFareByPostCollection = true;
  /** レスポンスデータの株主優待運賃判定 */
  @Input() isContainedShareholdersBenefitDiscountFare = false;

  // クレジットカード情報
  @Input() set creditCardInfo(value: AnabizCreditCardInformation) {
    this._creditCardInfo = value;
    this._cardHolderInfo.email = value?.mailAddress;
    if (this._cardHolderInfo.phone) {
      this._cardHolderInfo.phone.number = value?.phoneNumber ?? '';
      this._cardHolderInfo.phone.countryPhoneExtension = value?.countryNumber ?? '';
      this._cardHolderInfo.phone.phoneCountry = value?.phoneCountry ?? '';
    }
  }
  get creditCardInfo(): AnabizCreditCardInformation {
    return this._creditCardInfo;
  }
  private _creditCardInfo: AnabizCreditCardInformation = initAnabizCreditCardInformation();
  public isManageCodeEmpty: boolean = false;

  // カード名義人情報
  get cardHolderInfo(): AnabizCardHolderInfo {
    return this._cardHolderInfo;
  }
  set cardHolderInfo(value: AnabizCardHolderInfo) {
    this._cardHolderInfo = value;
    this._creditCardInfo.mailAddress = value.email;
    this._creditCardInfo.phoneCountry = value.phone?.phoneCountry;
    this._creditCardInfo.phoneNumber = value.phone?.number;
    this._creditCardInfo.countryNumber = value.phone?.countryPhoneExtension;
  }
  private _cardHolderInfo: AnabizCardHolderInfo = initAnabizCardHolderInfo();

  @ViewChild(AnabizPaymentInputCardInfoComponent) cardInfoComponent: AnabizPaymentInputCardInfoComponent | undefined;
  @ViewChild(AnabizPaymentInputCardHolderComponent) cardHolderComponent:
    | AnabizPaymentInputCardHolderComponent
    | undefined;
  @ViewChildren(PaymentInputShareholderCouponComponent)
  shareholderCouponComponents?: QueryList<PaymentInputShareholderCouponComponent>;

  //カードレス決済(契約形態が"P"、または" BPS ")
  @Input() isCardless: boolean = false;
  // 画面情報表示処理用
  @Output() displayScreenInformation = new EventEmitter<Event>();

  /** 画面出力用運賃ルール */
  private _outputFareConditions: OutputFareConditionsPerPtc[] = [];

  public selectedCard: string = 'other';

  // Cardinal決済判定
  private _is3DSPayment = false;

  // deviceId
  private _deviceId: string = '';

  // 確認ダイアログメッセージ
  private _msgId = '';

  /** キャッシュ */
  private _masterData: {
    airportCache: { [key: string]: string };
    ffCache: { [key: string]: string };
  } = {
    airportCache: {},
    ffCache: {},
  };

  @Input() prevScreenInfo: PreviousScreenHandoverInformation = {
    orderId: '',
    credential: {
      firstName: '',
      lastName: '',
    },
  };

  @Input() public isReadyToShow: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // 同意文言エリア設定項目
  public agreementAreaParams: AgreementAreaParts = {
    partsTitle: this._staticMsgPipe.transform('heading.agreement'),
    isModal: false,
    submitText: this._staticMsgPipe.transform('label.purchaseButton'),
  };

  public isDisplayPlanReviewLink: boolean = false;

  //画面のサイズを切り替えの設定
  public isSp = isSP();
  public isTb = isTB();
  public isPc = isPC();
  private _isSpPre = isSP();
  private _isTbPre = isTB();
  private _isPcPre = isPC();

  // MutationObserverのID保存用
  private mutationObserver?: MutationObserver;

  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _staticMsgPipe: StaticMsgPipe,
    private _modalService: ModalService,
    private _router: Router,
    private _dialogSvc: DialogDisplayService,
    private _getOrderStoreService: GetOrderStoreService,
    private _fareConditionsStoreService: FareConditionsStoreService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _paymentInputStoreService: PaymentInputStoreService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _aswMasterSvc: AswMasterService,
    private _presService: AnabizPaymentInputPresService,
    private _paymentInputPresService: PaymentInputPresService,
    private _paymentInputCardInfoService: PaymentInputCardInfoService,
    private _pageLoadingService: PageLoadingService,
    private _localDateService: LocalDateService,
    private _loadScriptService: LoadScriptService,
    private _aswMasterService: AswMasterService,
    private _elementRef: ElementRef,
    private _renderer: Renderer2,
    private _ngZone: NgZone,
    private _dcsDateService: DcsDateService,
    private _loggerService: LoggerDatadogService
  ) {
    super(_common);
  }

  public authFlag: boolean = true;

  reload(): void {}

  /**
   * 初期表示
   */
  init(): void {
    //新規フローか確認
    if (this._currentCartStoreService?.CurrentCartData.data?.cartId) {
      this.hasCartId = true;
    }

    this.subscribeService(
      'anabizPaymentAmountAreaCartInfoSubscription',
      this._currentCartStoreService.getCurrentCart$(),
      (value) => {
        this.isDisplayPlanReviewLink = !!value.data?.cartId;
      }
    );

    this.subscribeService(
      'AnabizPaymentPresResizeEvent',
      fromEvent(window, 'resize').pipe(throttleTime(500)),
      this.resizeEvent
    );

    this.reputationManagerInstall();
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
        .filter((a: HTMLAnchorElement) => a.id === 'openPaymentTerms' || a.id === 'openMiniRule')
        .forEach((a: HTMLAnchorElement) => {
          // u-payment-input-hyperlink-textのスタイルが設定されていない場合
          if (!a.classList.contains('u-payment-input-hyperlink-text')) {
            // aタグにイベントを設定する
            this._renderer.setAttribute(
              a,
              'onclick',
              a.id === 'openPaymentTerms'
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
        this._deviceId = bb;
      }
    };
    // snare.js のURL
    const snareUrl = this._aswMasterService.getMPropertyByKey('paymentInformationInput', 'reputationManager.snareUrl');
    // snare.js インストール
    this._loadScriptService.load$(snareUrl, true).subscribe();
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
      this._changeDetectorRef.markForCheck();
    }
  };

  /**
   *  支払情報詳細モーダル呼び出し
   */
  paymentDetails() {
    const part = defaultPaymentDetailsModalParts();
    part.payload = {} as PaymentDetailsPayload;
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
      'AnaBizIndividualCheck_Subscription',
      isError.subscribe((value) => {
        this._pageLoadingService.endLoading();
        if (value.promotionCodeErrorId) {
          this._errorsHandlerSvc.setRetryableError(PageType.PAGE, { errorMsgId: value.promotionCodeErrorId });
        } else if (value.isChangePromotionCode) {
          this.deleteSubscription('AnaBizIndividualCheck_Subscription');
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
    this._dialogSvc.openDialog({ message: 'test.dialog.message.choice' }).buttonClick$.subscribe((result) => {
      if (result.clickType === DialogClickType.CONFIRM) {
        // 確認が押された
        this._pageLoadingService.startLoading();
        let cartId = this._currentCartStoreService.CurrentCartData.data?.cartId ?? '';
        // 購入時運賃再計算API実行のためのパラメータを作成
        const ordersRepriceOrderRequestParam: OrdersRepriceOrderRequest = {
          orderId: this.prevScreenInfo.orderId, // 前画面引継ぎ情報
          credential: {
            firstName: this.prevScreenInfo.credential.firstName, // 前画面引継ぎ情報.代表者名
            lastName: this.prevScreenInfo.credential.lastName, // 前画面引継ぎ情報.代表者姓
          },
          cartId: cartId,
        };

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
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.BUSINESS_LOGIC, // ビジネスロジックエラー
              errorMsgId: errMsgId, // エラーメッセージID
              apiErrorCode: errorCode, // APIエラーレスポンス情報
            });
          }
        );
      } else if (result.clickType === DialogClickType.CLOSE) {
        // キャンセルが押された
      }
    });
  }

  /**
   * 支払い方法更新
   */
  updatePaymentMethod(isCreditCardPayment: boolean) {
    if (!this.isCardless) {
      //板カード
      if (isCreditCardPayment) {
        this.isCreditCardPayment = true;
        this.isReserveOnly = false;
      } else {
        this.isCreditCardPayment = false;
        this.isReserveOnly = true;
      }
    } else {
      //カードレス決済
      this.isReserveOnly = !this.isReserveOnly;
    }

    this.updateAgreement();

    this._changeDetectorRef.markForCheck();
  }

  /**
   * 同意文言エリア文言更新
   */
  updateAgreement() {
    //同意文言
    if (this.isWaitlisted) {
      this.agreementAreaParams = {
        ...this.agreementAreaParams,
        submitText: this._staticMsgPipe.transform('label.makeWaitinglistReservation'),
      };
    } else if (this.isReserveOnly) {
      this.agreementAreaParams = {
        ...this.agreementAreaParams,
        submitText: this._staticMsgPipe.transform('label.makeReservation'),
      };
    } else if (
      this.isTraveler &&
      this.issueFlag === '0' &&
      (this._getOrderStoreService.getOrderData.data?.orderStatus === 'unpurchased' ||
        this._getOrderStoreService.getOrderData.data?.orderStatus === 'applyingForTicketing')
    ) {
      this.agreementAreaParams = {
        ...this.agreementAreaParams,
        submitText: this._staticMsgPipe.transform('label.makeTicketingRequest'),
      };
    } else {
      this.agreementAreaParams = {
        ...this.agreementAreaParams,
        submitText: this._staticMsgPipe.transform('label.purchaseButton'),
      };
    }
    this._changeDetectorRef.markForCheck();
    this._changeDetectorRef.detectChanges();
  }

  /**
   * クレジットカード情報更新
   */
  updateSelectedCreditCard(cardInfo: AnabizBasicCardInfo) {
    if (this.creditCardInfo) {
      this.creditCardInfo.expiryDate = cardInfo.cardExpiryDate
        ? this._paymentInputCardInfoService.isExpired(cardInfo.cardExpiryDate, this._localDateService.getCurrentDate())
          ? ''
          : cardInfo.cardExpiryDate
        : '';
      this.creditCardInfo.holderName = cardInfo.ownerName ?? '';
      this.creditCardInfo.cardNumber = cardInfo.cardNumber ?? '';
      this.creditCardInfo.securityCode = cardInfo.cvv ?? '';
      this.creditCardInfo.isUatpCard = cardInfo.uatpCard ?? false;
    }
    this.cardInfoComponent?.resetCreditCardFormGroup();
    this.cardHolderComponent?.resetCreditCardHolderFormGroup();
    this.creditCardInfo.expiryDate = this._paymentInputCardInfoService.convertToDateYmFormData(
      cardInfo.cardExpiryDate ?? ''
    );
    this._changeDetectorRef.markForCheck();
  }

  /**
   * 選択中のクレジットカード情報更新
   */
  selectedCardChange(selectedCard: string) {
    if (this.creditCardInfo) {
      this.creditCardInfo.selectedCreditCard = selectedCard;
    }
  }

  refresh() {
    if (this.isCreditCardPayment && !this.isTraveler && !this.isCardless) {
      this.cardInfoComponent?.resetCreditCardFormGroup();
      this.cardHolderComponent?.resetCreditCardHolderFormGroup();
      this._changeDetectorRef.markForCheck();
    }
  }

  /**
   * クレジットカードバリデーションチェック
   * @return バリデーション結果
   */
  runCreditCardValidation(): boolean {
    const cardInfoValidity = this.cardInfoComponent?.isValid() ?? false;
    const cardHolderValidity = this.cardHolderComponent?.isValid() ?? false;
    return cardInfoValidity && cardHolderValidity;
  }

  /**
   * 支払規約リンク押下処理
   * @param event エレメントのイベント情報
   */
  public openPaymentTerms(event?: Event): void {
    //イベントが渡された場合、preventDefaultで遷移処理を中止する
    if (event) {
      event.preventDefault();
    }

    // メッセージキーを作成
    const messageKey: string = `label.paymentTerms.details.${PaymentMethodsType.CREDIT_CARD}`;

    // Pos付きでメッセージを取得
    let message = this._staticMsgPipe.transform(
      `${messageKey}.${this._common.aswContextStoreService.aswContextData.posCountryCode}`
    );

    // 取得できてない場合(キーが変換できていない)
    if (message.includes(messageKey)) {
      // posなしで取得
      message = this._staticMsgPipe.transform(`${messageKey}`);
    }

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
      this._aswMasterSvc
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
      this._aswMasterSvc.load(getFareConditionsMasterKey(lang), true),
      (data) => {
        this.deleteSubscription('AnaBizPaymentInputPresComponent GetFareConditions');
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
   * 同意ボタンのクリック処理
   */
  clickAgree() {
    let isValidationError = false;
    //板カード決済バリデーションチェック
    if (this.isCreditCardPayment && !this.isCardless) {
      if (!this.runCreditCardValidation()) {
        isValidationError = true;
      }
    }
    //株主優待バリデーションチェック
    if (this.shareholderCouponComponents) {
      this.shareholderCouponComponents.forEach((component) => {
        if (!component.runValidation()) {
          isValidationError = true;
        }
      });
    }
    if (isValidationError) return;

    this._msgId = this.paymentConfirmation();
    if (!this._msgId) {
      // msgId未設定する場合は確認ダイアログは表示せずに購入処理を継続する
      this.continuePaymentProcess();
      return;
    }
    // 確認ダイアログ表示
    const dialogInfo: DialogInfo = {
      type: DialogType.CHOICE, //ダイアログタイプ
      message: 'm_dynamic_message-' + this._msgId, //ダイアログのメッセージID
    };
    this.subscribeService(
      'anaBizPaymentInputPresComponent_toBookingComplete',
      this._dialogSvc.openDialog(dialogInfo).buttonClick$,
      (result) => {
        this.deleteSubscription('anaBizPaymentInputPresComponent_toBookingComplete');
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
    // 同意文言エリアの同意ボタンが発券要求を行う旨の場合
    if (this._msgId === 'MSG1490') {
      // 発券要求
      this._presService.executeTicketingRequest(
        {
          approverId: this.approverId,
          isCreditCardPayment: this.isCreditCardPayment,
          isWaitlisted: this.isWaitlisted,
          prevScreenInfo: this.prevScreenInfo,
          ticketingComment: undefined,
        },
        () => {
          this._pageLoadingService.endLoading();
        }
      );
    } else {
      if (!(this.isReserveOnly || this._getOrderStoreService.getOrderData.data?.air?.isContainedWaitlistedSegment)) {
        // クレジットカードPAN情報取得
        this._presService.invokeGetCreditPanInformationApi(
          (response) => {
            // 正常時、購入・発券処理をコールバック
            if (!this._deviceId && this.isCreditCardPayment) {
              // snare.js のURL
              const snareUrl = this._aswMasterService.getMPropertyByKey(
                'paymentInformationInput',
                'reputationManager.snareUrl'
              );
              // snare.js インストール
              this._loadScriptService.load$(snareUrl, true).subscribe((loadSuccess) => {
                if (!loadSuccess) {
                  this._loggerService.error(LogType.PAGE_VIEW, { errMsg: 'anabiz snare.js load error!' });
                }
                if (!this._deviceId) {
                  this._loggerService.error(LogType.PAGE_VIEW, {
                    errMsg: `anabiz snare.js get deviceId error ${(window as any).io_last_error}`,
                  });
                  this._errorsHandlerSvc.setNotRetryableError({
                    errorType: ErrorType.BUSINESS_LOGIC,
                    errorMsgId: 'E1861',
                  });
                } else {
                  this._executePaymentRecords();
                }
              });
            } else {
              // 購入・発券処理
              this._executePaymentRecords();
            }
          },
          (error) => {
            // 異常時、エラー処理をコールバック
            // apiErrorが非同期で設定されるのを待つ
            this._common.apiErrorResponseService.getApiErrorResponse$().subscribe((apiError) => {
              if (apiError) {
                // apiErrorがnullでない場合にエラーコードを取得
                const errorCode = apiError.errors?.[0]?.code ?? '';
                // エラー処理
                defaultApiErrorEvent(
                  errorCode,
                  InvokeGetCreditPanInformationApiErrorMap,
                  (retryable) => {
                    this._common.errorsHandlerService.setRetryableError(PageType.PAGE, retryable);
                    window.scroll({
                      top: 0,
                    } as ScrollToOptions);
                  },
                  (notRetryable) => {
                    this._common.errorsHandlerService.setNotRetryableError(notRetryable);
                  }
                );
              }
            });
            this._pageLoadingService.endLoading();
          }
        );
      } else {
        // 購入・発券処理
        this._executePaymentRecords();
      }
    }
  }

  /** 購入・発券処理 */
  private _executePaymentRecords() {
    this._presService.executePaymentRecords(
      {
        deviceId: this._deviceId,
        creditCardInfo: this.creditCardInfo,
        _is3DSPayment: this._is3DSPayment,
        isCreditCardPayment: this.isCreditCardPayment,
        isReserveOnly: this.isReserveOnly,
        isWaitlisted: this.isWaitlisted,
        prevScreenInfo: this.prevScreenInfo,
        shareholderCoupons: this.isReserveOnly ? [] : this.shareholderCoupons,
        isCardless: this.isCardless,
      },
      () => {
        this._pageLoadingService.endLoading();
      }
    );
  }

  /**
   * 同意ボタン押下時に支払方法ごとの確認ダイアログ表示
   * @returns ダイアログに表示するメッセージID
   */
  paymentConfirmation(): string {
    let msg = '';
    //予約のみ識別子
    if (this.isReserveOnly) {
      msg = 'MSG1488'; //予約を行う旨
    } else if (this._getOrderStoreService.getOrderData.data?.air?.isContainedWaitlistedSegment) {
      msg = ''; //空席待ち予約の場合、確認ダイアログ表示不要
    } else if (
      (this._getOrderStoreService.getOrderData.data?.orderStatus === 'unpurchased' ||
        this._getOrderStoreService.getOrderData.data?.orderStatus === 'applyingForTicketing') &&
      this.issueFlag === '0' &&
      this.isTraveler
    ) {
      msg = 'MSG1490'; //発券要求を行う旨
    } else if (this.isCreditCardPayment) {
      msg = 'MSG0687'; //認証画面へ遷移する場合がある旨
    } else {
      const isWaitlisted = this._getOrderStoreService.getOrderData.data?.air?.isContainedWaitlistedSegment ?? false;
      if (this.issueFlag === '1' && !this.isTraveler && !isWaitlisted) {
        msg = 'MSG1491'; // 購入を行うかを確認する旨
      }
    }
    return msg;
  }

  /**
   * 株主優待エリア情報受け取り関数
   * @param traveler 変更を行った搭乗者
   * @param flight 変更を行ったフライト
   */
  public modifyShareholderCoupon(traveler: Partial<TravelerType>, flight: FlightType) {
    if (traveler.travelerId) {
      const cflight = this.shareholderCoupons
        ?.find((bound) => bound.flights.some((cflight) => cflight.flightId === flight.flightId))
        ?.flights?.find((cflight) => cflight.flightId === flight.flightId);
      const travelerIndex =
        cflight?.travelers.findIndex((ctraveler) => ctraveler.travelerId === traveler.travelerId) ?? -1;
      if (cflight && travelerIndex !== -1) {
        cflight.travelers[travelerIndex] = {
          ...cflight.travelers[travelerIndex],
          number: traveler.number ?? '',
          pin: traveler.pin ?? '',
        };
      }
    }
  }
}
