import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { delay, distinctUntilChanged, filter, first, map, take } from 'rxjs/operators';
import { SupportPageComponent } from '@lib/components/support-class';
import { AlertMessageItem, AlertType, ErrorType, LoginStatusType, PageType } from '@lib/interfaces';
import { PlanReviewContService } from './plan-review-cont.service';
import {
  AswContextStoreService,
  AswMasterService,
  CommonLibService,
  ErrorsHandlerService,
  ModalService,
  PageInitService,
  PageLoadingService,
  SystemDateService,
} from '@lib/services';
import { AswCommonState } from '@lib/store';
import {
  GetCartStoreService,
  GetPlansStoreService,
  CreateCartStoreService,
  CurrentCartStoreService,
  CurrentPlanStoreService,
  LocalPlanService,
  UpsellService,
  DeliveryInformationStoreService,
  PlanReviewStoreService,
  DcsDateService,
  RoundtripOwdService,
  FareConditionsStoreService,
  GetUnavailablePaymentByOfficeCodeService,
  OrdersReservationAvailabilityStoreService,
} from '@common/services';
import {
  CreateCartRequest,
  PlansGetPlansResponse,
  PlansGetPlansResponsePlansInner,
  PostGetCartRequest,
} from 'src/sdk-reservation';
import { PlanReviewPresComponent } from '../presenter/plan-review-pres.component';
import { agreementHkModalParts } from '../sub-components/modal/plan-review-agreement-hk-modal/plan-review-agreement-hk-modal.state';
import { agreementKrModalParts } from '../sub-components/modal/plan-review-agreement-kr-modal/plan-review-agreement-kr-modal.state';
import {
  DisplayInfoJSON,
  dynamicSubject,
  getPlanReviewContComponentMasterKey,
  PlanReviewDynamicParams,
  TEMP_URL_KEY,
  GetOrdersReservationAvailabilityApiErrorMap,
} from './plan-review-cont.component.state';
import { FareConditionsState, GetCartState, GetPlansState, CurrentCartState } from '@common/store';
import {
  apiEventAll,
  fixedArrayCache,
  getDisplayCart,
  isEmptyObject,
  isStringEmpty,
  defaultApiErrorEvent,
} from '@common/helper';
import { RoutesResRoutes } from '@conf/routes.config';
import {
  ANA_BIZ_OFFICE_CODE,
  JAPANESE_REVENUE_OFFICE_CODE,
  ReservationFunctionIdType,
  ReservationPageIdType,
  OfficeAllData,
} from '@common/interfaces';
import { M_OFFICE } from '@common/interfaces/common/m_office';
import { MasterStoreKey } from '@conf/asw-master.config';
import { ReservationAvailabilityRequest } from 'src/sdk-member';
import { selectNextPageModalPayloadParts } from '../../id-modal/passenger-information-request/modal/select-next-page-modal/select-next-page-modal-payload.state';
import { PlanReviewService } from '../service/plan-review.service';
import { ErrorCodeConstants } from '@conf/app.constants';
import { DatePipe } from '@angular/common';

/**
 * R01P040 プラン確認画面
 */
@Component({
  selector: 'asw-plan-review-cont',
  templateUrl: './plan-review-cont.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewContComponent extends SupportPageComponent {
  @ViewChild(PlanReviewPresComponent)
  private _presComponent?: PlanReviewPresComponent;

  /** 機能ID */
  public functionId = ReservationFunctionIdType.PRIME_BOOKING; // 'R01'
  /** 画面ID */
  public pageId = ReservationPageIdType.PLAN_REVIEW; // 'P040'

  // 初期化処理自動完了をオフにする
  override autoInitEnd = false;

  /** ユーザ保有プランリスト */
  public myPlanList?: PlansGetPlansResponse = {};

  /** プラン有効判定 */
  public isPlanValid = false;

  /** 後続フローからの遷移フラグ */
  public isCameFromLater = false;

  /** オフィスキャッシュ */
  public officeCache: OfficeAllData[] = [];

  /** 運賃ルール・手荷物情報取得APIレスポンス */
  public fareConditionsResponse?: FareConditionsState;

  /** Tealium用searchCriteria */
  private _aswPageOutputSearchCriteria?: object;

  /** 規約モーダル表示フラグ */
  private _hasShowAgreementModal = false;

  /** 画面情報JSON */
  private displayInfoJSON: DisplayInfoJSON = {};

  /** 特典予約フラグ */
  public isAwardBooking = false;

  /** ログインステータス */
  private loginStatus?: LoginStatusType;

  /* 現在時刻 */
  sysDate = this._getSystemDate.getSystemDate();

  /**
   * コンストラクタ
   */
  constructor(
    private _common: CommonLibService,
    private _pageInitService: PageInitService,
    private _pageLoadingService: PageLoadingService,
    private _router: Router,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _activatedRoute: ActivatedRoute,
    private _getPlansStoreService: GetPlansStoreService,
    private _getCartStoreService: GetCartStoreService,
    private _createCartStoreService: CreateCartStoreService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _currentPlanStoreService: CurrentPlanStoreService,
    private _localPlanService: LocalPlanService,
    private _deliveryInfoStoreService: DeliveryInformationStoreService,
    private _planReviewStoreService: PlanReviewStoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _aswMasterSvc: AswMasterService,
    private _aswContextSvc: AswContextStoreService,
    private _modalService: ModalService,
    private _upsellService: UpsellService,
    private _contService: PlanReviewContService,
    private _dcsDateService: DcsDateService,
    private _roundtripOwdService: RoundtripOwdService,
    private _fareConditionsStoreService: FareConditionsStoreService,
    private _getUnavailablePaymentByOfficeCodeService: GetUnavailablePaymentByOfficeCodeService,
    private _ordersReservationAvailabilityStoreService: OrdersReservationAvailabilityStoreService,
    private _planReviewService: PlanReviewService,
    private _getSystemDate: SystemDateService,
    private _datePipe: DatePipe
  ) {
    super(_common, _pageInitService);

    // タブバーに画面タイトルを設定する
    this._contService.setTitle();

    // 前画面情報
    const prevPageId = this._common.aswCommonStoreService.aswCommonData.pageId ?? '';
    const prevFunctionId = this._common.aswCommonStoreService.aswCommonData.functionId ?? '';
    let previousPage = prevFunctionId + prevPageId;

    // 後続フローからの遷移の場合、前画面情報を空にする
    this.isCameFromLater = ['R01P070', 'R01P080'].includes(previousPage);
    if (this.isCameFromLater) {
      previousPage = '';
    }

    // 前画面から連携されたTealium用searchCriteriaを保持
    this._aswPageOutputSearchCriteria = this._contService.getAswSearchCriteria();

    // プラン確認画面storeの初期化
    this._planReviewStoreService.resetPlanReview();
    // 前画面引継ぎ情報storeの特定項目初期化
    this._deliveryInfoStoreService.setDefaultDeliveryInformation({
      planReviewInformation: {
        ...this._deliveryInfoStoreService.deliveryInformationData.planReviewInformation,
        isPlanDuplicationFailed: undefined,
        isBackBtnClicked: undefined,
      },
      passToPayment: {
        isReserveDeliveryData: false,
        errInfo: this._deliveryInfoStoreService.deliveryInformationData.passToPayment?.errInfo ?? [],
      },
    });

    // 前画面情報をStoreに格納
    this._planReviewStoreService.updatePlanReview({ previousPage: previousPage });
    // サブヘッダに反映するためmarkForCheck
    this._changeDetectorRef.markForCheck();

    // 当画面の情報を設定
    const commonStateParams: AswCommonState = {
      functionId: this.functionId,
      subFunctionId: '',
      pageId: this.pageId,
      subPageId: '',
      isEnabledLogin: false,
    };
    this._common.aswCommonStoreService.setAswCommon(commonStateParams);
  }

  /**
   * 初期表示処理
   */
  init() {
    // キャッシュ取得を待って後続処理実行
    this.subscribeService(
      'PlanReviewContComponent getMasterDataAll',
      this._aswMasterSvc.load(getPlanReviewContComponentMasterKey(), true),
      ([officeCache]) => {
        this.deleteSubscription('PlanReviewContComponent getMasterDataAll');
        this.officeCache = fixedArrayCache(officeCache);
        if (this._common.isNotLogin()) {
          // 未ログインの場合、有効期限切れのプランをローカルストレージから削除する
          this.deleteExpiredLocalPlan();
        }
        // 後続処理へ
        this.branchByInfluxRoute();
      }
    );

    //セッションストレージからaswServiceを削除する
    sessionStorage.removeItem('aswService');
  }

  /**
   * 流入経路による振り分け
   */
  branchByInfluxRoute() {
    // プランリスト画面からの遷移の場合、myPlanListと経由判定を設定
    const previousPage = this._planReviewStoreService.PlanReviewData.previousPage ?? '';
    if (previousPage === 'R01P042') {
      this.myPlanList = this._getPlansStoreService.GetPlansData;
      this._deliveryInfoStoreService.setDeliveryInformationByKey('planReviewInformation', 'isCameFromPlanList', true);
    } else {
      this._deliveryInfoStoreService.setDeliveryInformationByKey('planReviewInformation', 'isCameFromPlanList', false);
    }

    // 提携：カートIDが存在しない場合、ログイン状態に応じてプランリストを取得
    if (
      !this._currentCartStoreService.CurrentCartData.data?.cartId ||
      this._currentCartStoreService.CurrentCartData.data?.cartId === ''
    ) {
      if (this._common.isNotLogin()) {
        // 未ログインの場合
        this.myPlanList = this._localPlanService.getLocalPlans();
        const isLocalPlanExists = this.myPlanList && this.myPlanList?.plans?.filter((plan) => !plan.isUnsaved).length;
        const queryParams = this._activatedRoute.snapshot.queryParams;
        // Deeplink、シェアリンクからの遷移ではないかつ、ローカルプラン0件の場合エラーとする
        if (!(TEMP_URL_KEY in queryParams) && !isLocalPlanExists) {
          this._errorsHandlerSvc.setNotRetryableError({
            errorType: ErrorType.BUSINESS_LOGIC,
            errorMsgId: 'EA030',
          });
          return;
        }
        if (isLocalPlanExists) {
          // ローカルプランを操作中プランに設定
          const cartId = this.myPlanList?.plans?.filter((plan) => !plan.isUnsaved)[0]?.cartId ?? '';
          this._currentPlanStoreService.setCurrentPlanFromPlanList(cartId, this.myPlanList);
        }
        this.callBeforeEvents();
      } else {
        // ログイン済みの場合、プランリスト取得APIを呼び出し操作中プランを設定
        const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId ?? '';
        this.setCurrentPlanFromApi(cartId, () => {
          this.callBeforeEvents();
        });
      }
    } else {
      this.callBeforeEvents();
    }
  }

  private callBeforeEvents() {
    // クエリパラメータに一時会員番号が存在するか否かにより処理分岐
    const queryParams = this._activatedRoute.snapshot.queryParams;
    if (TEMP_URL_KEY in queryParams) {
      // 一時会員番号が存在する場合
      const tempNum: string = queryParams[TEMP_URL_KEY];
      const urlType = tempNum.slice(0, 3);

      if (urlType === 'DPL' || urlType === 'SHR') {
        // DPL・SHR共通で行うプランリスト取得処理へ進む
        this.getPlanFromTempUrl(tempNum, urlType);
      } else {
        // Deeplinkでもシェアでもない場合、共通エラー画面へ
        this._errorsHandlerSvc.setNotRetryableError({
          errorType: ErrorType.BUSINESS_LOGIC,
          errorMsgId: 'E0365',
        });
      }
    } else {
      // 一時会員番号が存在しない場合

      const isNeedGetCart =
        this._deliveryInfoStoreService.deliveryInformationData.planReviewInformation?.isNeedGetCart ?? true;
      const cartId =
        this._currentCartStoreService.CurrentCartData.data?.cartId ||
        this._currentPlanStoreService.CurrentPlanData.cartId;

      if (isNeedGetCart && !isStringEmpty(cartId)) {
        // カート取得が必要な場合、通常のカート取得処理を呼ぶ
        this.retrieveCart(cartId ?? '', () => {
          // 特典フラグ取得
          const fareType: string =
            this._currentCartStoreService.CurrentCartData.data?.plan?.airOffer?.bounds?.[0]?.flights?.[0]?.fareInfos
              ?.fareType ?? '';
          if (fareType === 'awardFare') {
            this.isAwardBooking = true;
            // 予約可否判断API呼び出し
            this._planReviewService.setReservationAvailabilityFromApi({
              cartId: (this._currentCartStoreService.CurrentCartData.data?.cartId ||
                this._currentPlanStoreService.CurrentPlanData.cartId) as string,
            });
            this._changeDetectorRef.detectChanges();
          }

          this.getPlanList(() => this.checkOffice());
        });
      }
      if (!isNeedGetCart) {
        // 遷移元から渡されたカート取得要否がfalseの場合、カート取得済みとみなし次の処理へ
        this.getPlanList(() => this.checkOffice());
      }
      if (isStringEmpty(cartId)) {
        // カートIDが存在しない場合、システムエラー
        this._errorsHandlerSvc.setNotRetryableError({
          errorType: ErrorType.SYSTEM,
        });
        return;
      }
    }

    // カート取得要否をリセット
    this._deliveryInfoStoreService.setDeliveryInformationByKey('planReviewInformation', 'isNeedGetCart', undefined);
  }

  /**
   * カートリトリーブ処理
   * @param cartId
   */
  retrieveCart(cartId: string, afterEvent?: () => void): void {
    const request: PostGetCartRequest = {
      cartId: cartId,
      refresh: true,
      mask: true,
    };

    // カート取得API実行
    apiEventAll(
      () => {
        if (!this._getCartStoreService.GetCartData.isPending) {
          this._getCartStoreService.setGetCartFromApi(request);
        }
      },
      this._getCartStoreService.getGetCart$(),
      (response) => {
        this._pageLoadingService.endLoading();
        // 取得したカートを操作中カートに設定
        this._currentCartStoreService.setCurrentCart(response);

        if (afterEvent) {
          // currentCartのsetを待って後続処理を実行
          this.subscribeService(
            'PlanReviewContComponent retrieveCart setCurrentCart',
            this._currentCartStoreService.getCurrentCart$().pipe(
              delay(500),
              first((store) => !store.isPending)
            ),
            () => {
              this.deleteSubscription('PlanReviewContComponent retrieveCart setCurrentCart');
              afterEvent();
            }
          );
        }
      },
      (error) => {
        const apiErr = this._common.apiError?.errors?.[0]?.code ?? '';
        this._contService.handleGetCartError(apiErr);
      }
    );
  }

  /**
   * 一時URL流入時共通処理
   * @param tempNum
   * @param urlType
   */
  getPlanFromTempUrl(tempNum: string, urlType: string): void {
    // 前画面情報をクリア
    this._planReviewStoreService.updatePlanReview({ previousPage: '' });
    // サブヘッダに反映するためmarkForCheck
    this._changeDetectorRef.markForCheck();

    // プランリスト取得APIを実行
    apiEventAll(
      () => this._getPlansStoreService.setGetPlansFromApi({ temporaryNumber: tempNum }),
      this._getPlansStoreService.getGetPlans$(),
      (response) => {
        if (this._common.aswContextStoreService.aswContextData.loginStatus === 'TEMPORARY_LOGIN') {
          this._contService.askForLoginTemp(() => {
            if (urlType === 'DPL') {
              // Deeplink流入時処理
              this._pageLoadingService.startLoading();
              this.deeplink(response);
            } else {
              // シェア流入時処理 に進む
              this._pageLoadingService.startLoading();
              this.sharePlan(response, tempNum);
            }
          });
        } else {
          if (urlType === 'DPL') {
            // Deeplink流入時処理
            this.deeplink(response);
          } else {
            // シェア流入時処理 に進む
            this.sharePlan(response, tempNum);
          }
        }
      },
      (error) => {
        const apiErr = this._common.apiError?.errors?.[0]?.code ?? '';
        if (apiErr === ErrorCodeConstants.ERROR_CODES.EBAZ000288) {
          // ローディングを一旦終了
          this._pageLoadingService.endLoading();
          // 未ログイン者に対しログインモーダル表示
          this._contService.askForLogin(() => {
            // ログイン後
            this._pageInitService.startInit();
            // Deeplink流入処理をやりなおす
            this.getPlanFromTempUrl(tempNum, 'DPL');
          });
        } else {
          let errMsg = '';
          switch (apiErr) {
            case ErrorCodeConstants.ERROR_CODES.EBAZ000286:
              errMsg = 'E0367';
              break;
            case ErrorCodeConstants.ERROR_CODES.EBAZ000287:
              errMsg = 'E0368';
              break;
            case ErrorCodeConstants.ERROR_CODES.EBAZ000290:
              errMsg = 'E0369';
              break;
            case ErrorCodeConstants.ERROR_CODES.EBAZ000289:
              errMsg = 'E0370';
              break;
            default:
              break;
          }
          if (!isStringEmpty(errMsg)) {
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.BUSINESS_LOGIC,
              errorMsgId: errMsg,
              apiErrorCode: apiErr,
            });
          } else {
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.SYSTEM,
              apiErrorCode: apiErr,
            });
          }
        }
      }
    );
  }

  /**
   * Deeplink流入時処理
   */
  deeplink(getPlansRes: GetPlansState): void {
    const apiPlanList = getPlansRes;
    const apiPlan = apiPlanList.plans?.[0] ?? {};
    const cartId = apiPlan.cartId ?? '';

    if (this._common.isNotLogin()) {
      // 未ログインの場合

      const localPlanList = this._localPlanService.getLocalPlans();
      if (localPlanList) {
        // ローカルプランリストが存在する場合

        const localPlanIndex = localPlanList?.plans?.findIndex((plan) => plan.cartId === cartId) ?? -1;
        const localPlan = localPlanIndex !== -1 ? localPlanList.plans?.[localPlanIndex] : null;

        if (localPlan) {
          // カートIDの一致するローカルプランが存在する場合
          const localPlanListLastModDate = new Date(localPlan.planLastModificationDate ?? '');
          const apiPlanListLastModDate = new Date(apiPlan.planLastModificationDate ?? '');
          // NaN判定
          const isLocalPlanDateValid = !Number.isNaN(localPlanListLastModDate.getTime());
          const isApiPlanDateValid = !Number.isNaN(apiPlanListLastModDate.getTime());
          const isOnlyApiPlanDateValid = !isLocalPlanDateValid && isApiPlanDateValid;

          if (localPlanListLastModDate < apiPlanListLastModDate || isOnlyApiPlanDateValid) {
            // APIから返却されたプラン情報の方が新しい場合
            const newLocalPlan = {
              ...localPlan,
              creationPointOfSaleId: apiPlan.creationPointOfSaleId,
              planName: apiPlan.planName,
              creationDate: apiPlan.creationDate,
              planExpiryDate: apiPlan.planExpiryDate,
              planLastModificationDate: apiPlan.planLastModificationDate,
            };

            // 更新対象のプランをnewLocalPlanに置き換える
            localPlanList.plans?.splice(localPlanIndex, 1, newLocalPlan);
            this._localPlanService.setLocalPlans(localPlanList);
            // newLocalPlanを操作中プランとする
            this._currentPlanStoreService.setCurrentPlan(newLocalPlan);
          } else {
            // ローカルプランの方が新しい場合、ローカルプランを操作中プランとする
            this._currentPlanStoreService.setCurrentPlan(localPlan);
          }
        } else {
          // カートIDの一致するプランが存在しない場合

          // APIプランをローカルプランリストに追加
          localPlanList.plans?.push(apiPlan);
          this._localPlanService.setLocalPlans(localPlanList);
          // APIプランを操作中プランにする
          this._currentPlanStoreService.setCurrentPlan(apiPlan);
        }
      } else {
        // ローカルプランリストが存在しない場合

        // APIプランを含むローカルプランリストを作成
        this._localPlanService.setLocalPlans({ plans: [apiPlan] });
        // APIプランを操作中プランとする
        this._currentPlanStoreService.setCurrentPlan(apiPlan);
      }
    } else {
      // ログイン状態の場合、APIプランを操作中プランとする
      this._currentPlanStoreService.setCurrentPlan(apiPlan);
      this.myPlanList = { ...apiPlanList };
    }

    // カート取得APIを実行
    this.retrieveCart(cartId, () => this.getPlanList(() => this.checkOffice()));
  }

  /**
   * シェア流入時処理
   */
  sharePlan(getPlansRes: GetPlansState, tempNum: string): void {
    const apiPlan = getPlansRes.plans?.[0] ?? {};
    // カート取得APIを実行
    const getCartRequestParameter: PostGetCartRequest = {
      cartId: apiPlan.cartId ?? '',
      temporaryNumber: tempNum,
      refresh: true,
      mask: false,
    };
    apiEventAll(
      () => {
        if (!this._getCartStoreService.GetCartData.isPending) {
          this._getCartStoreService.setGetCartFromApi(getCartRequestParameter);
        }
      },
      this._getCartStoreService.getGetCart$(),
      (response) => {
        this.duplicateCart(response, () => this.getPlanList(() => this.checkOffice()));
      },
      (error) => {
        const apiErr = this._common.apiError?.errors?.[0]?.code ?? '';
        this._contService.handleGetCartError(apiErr);
      }
    );
  }

  /**
   * カート複製処理
   * @param originalCart
   */
  duplicateCart(originalCart: GetCartState, afterEvent: () => void): void {
    // カート作成APIを実行し、カートを複製
    const createCartRequestParameter: CreateCartRequest = {
      airOfferId: getDisplayCart(originalCart.data ?? {})?.airOfferIds?.[0]?.offerNdcId ?? '',
      searchAirOffer: originalCart.data?.searchCriteria?.searchAirOffer,
    };
    apiEventAll(
      () => this._createCartStoreService.setCreateCartFromApi(createCartRequestParameter),
      this._createCartStoreService.getCreateCart$(),
      (response) => {
        this._pageLoadingService.endLoading();
        // カート作成APIから返却された複製カートを操作中カートとする
        this._currentCartStoreService.setCurrentCart(response);
        // 後続処理を実行
        afterEvent();
      },
      (error) => {
        const apiErr = this._common.apiError?.errors?.[0]?.code ?? '';
        switch (apiErr) {
          case ErrorCodeConstants.ERROR_CODES.EBAZ000400:
          case ErrorCodeConstants.ERROR_CODES.EBAZ000422:
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.BUSINESS_LOGIC,
              errorMsgId: 'E0371',
              apiErrorCode: apiErr,
            });
            break;
          case ErrorCodeConstants.ERROR_CODES.EBAZ000423:
            // 遷移先に渡す情報を設定
            // 検索条件（を含むカート情報）
            this._currentCartStoreService.setCurrentCart(originalCart);
            // プラン作成失敗判定
            this._deliveryInfoStoreService.setDeliveryInformationByKey(
              'planReviewInformation',
              'isPlanDuplicationFailed',
              true
            );
            // バウンド数等々に応じた空席照会結果画面へ遷移
            this.backToFlightAvailability(originalCart);
            break;
          default:
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.SYSTEM,
              apiErrorCode: apiErr,
            });
            break;
        }
      }
    );
  }

  /**
   * カートに応じ適切な空席照会結果画面に遷移する処理
   * @param cart
   */
  backToFlightAvailability(cart: GetCartState): void {
    const boundNum = cart.data?.searchCriteria?.searchAirOffer?.itineraries?.length;
    if (!boundNum) {
      this._errorsHandlerSvc.setNotRetryableError({
        errorType: ErrorType.SYSTEM,
      });
    } else if (boundNum > 2) {
      this._router.navigateByUrl(RoutesResRoutes.COMPLEX_FLIGHT_AVAILABILITY);
    } else {
      // FY25: 往復(国内)へのルート追加
      const displayCartPlan = getDisplayCart(cart.data ?? {});
      const isDomestic = displayCartPlan?.airOffer?.tripType === 'domestic';
      // DCS移行開始日前後判定
      const departureDate = displayCartPlan?.airOffer?.bounds?.[0]?.originDepartureDateTime ?? '';
      const isAfterDcs = this._dcsDateService.isAfterDcs(departureDate);
      if (isDomestic && isAfterDcs) {
        // DCS移行開始日以降かつ日本国内単独旅程の場合、往復(国内)へ
        this._router.navigateByUrl(RoutesResRoutes.ROUNDTRIP_FLIGHT_AVAILABILITY_DOMESTIC);
      } else {
        this._router.navigateByUrl(RoutesResRoutes.ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL);
      }
    }
  }

  /**
   * プランリスト取得処理
   */
  getPlanList(afterEvent?: () => void): void {
    if (!!this.myPlanList?.plans?.length) {
      // myPlanListが既に存在する場合
      // 操作中プランが含まれる場合、操作中プラン情報を更新
      const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId ?? '';
      this._currentPlanStoreService.setCurrentPlanFromPlanList(cartId, this.myPlanList);
      // 後続処理を実行
      if (afterEvent) {
        afterEvent();
      }
    } else {
      // myPlanListが空の場合、ログイン状態に応じてプランリストを取得
      if (this._common.isNotLogin()) {
        // 未ログインの場合
        this.myPlanList = this._localPlanService.getLocalPlans();
        if (this.myPlanList) {
          // 操作中プランが含まれる場合、操作中プラン情報を更新
          const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId ?? '';
          this._currentPlanStoreService.setCurrentPlanFromPlanList(cartId, this.myPlanList);
        }
        // 後続処理を実行
        if (afterEvent) {
          afterEvent();
        }
      } else {
        // ログイン済みの場合、プランリスト取得APIを呼び出し操作中プランを設定
        const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId ?? '';
        this.setCurrentPlanFromApi(cartId, () => {
          // 後続処理を実行
          if (afterEvent) {
            afterEvent();
          }
        });
      }
    }
  }

  /**
   * オフィス判定処理
   * （含：規約モーダル表示）
   */
  checkOffice(): void {
    const currentCart = this._currentCartStoreService.CurrentCartData.data;

    // プランの有効／無効を判定
    this.isPlanValid = !isEmptyObject(currentCart?.plan ?? {});
    // カート作成オフィスのオフィスコードを取得
    const cartOfficeCode = this._currentPlanStoreService.CurrentPlanData.creationPointOfSaleId;

    // キャッシュからカート作成オフィスの情報を検索
    const cartOfficeInfo = this.officeCache?.find((data) => data.office_code === cartOfficeCode);
    // 操作オフィスのオフィスコードを取得
    const currentOfficeCode = this._common.aswContextStoreService.aswContextData.pointOfSaleId;

    // BizオフィスかつBiz不可運賃 || Bizオフィスかつ国際旅程 || Biz以外のオフィスかつBiz専用運賃の場合、共通エラー
    let errorFlg = false;
    this._contService.checkBizCoherence(currentOfficeCode, currentCart ?? {}, (errorId) => {
      this._common.errorsHandlerService.setNotRetryableError({
        errorType: ErrorType.BUSINESS_LOGIC,
        errorMsgId: errorId,
      });
      errorFlg = true;
    });
    // 処理速度が速い場合に共通エラー画面遷移前に規約モーダルが開いてしまう事象対策
    if (errorFlg) {
      return;
    }

    if (!cartOfficeCode || cartOfficeCode === currentOfficeCode) {
      // 作成オフィスと操作オフィスが一致する場合、または作成オフィスが存在しない場合
      // 操作オフィス適切フラグをtrueにする
      this._planReviewStoreService.updatePlanReview({ isRightOffice: true });
      // 韓国・香港モーダル表示処理へ
      this.showHkKrModal();
    } else {
      // オフィスが異なる場合
      // 提携：オフィスが異なる場合エラー画面に遷移
      if (currentOfficeCode === JAPANESE_REVENUE_OFFICE_CODE) {
        // 個札モードで遷移 かつ 法人モードで保存したプランを表示 の場合
        this._common.errorsHandlerService.setNotRetryableError({
          errorType: ErrorType.BUSINESS_LOGIC,
          errorMsgId: 'EA029',
        });
      } else {
        // 法人モードで遷移 かつ 個札モードで保存したプランを表示の場合
        this._common.errorsHandlerService.setNotRetryableError({
          errorType: ErrorType.BUSINESS_LOGIC,
          errorMsgId: 'EA028',
        });
      }
    }
  }

  /**
   * 香港・韓国モーダル表示処理
   */
  showHkKrModal(): void {
    const officePos = this._common.aswContextStoreService.aswContextData.posCountryCode;
    const previousPage = this._planReviewStoreService.PlanReviewData.previousPage ?? '';

    if (['HK', 'KR'].includes(officePos) && !this.isCameFromLater) {
      // モーダルでの同意完了後に後続処理に進む
      this.subscribeService(
        'PlanReviewContComponent isHkKrAgreed',
        this._planReviewStoreService.getPlanReview$().pipe(first((store) => !!store.isHkKrAgreed)),
        () => {
          this.deleteSubscription('PlanReviewContComponent isHkKrAgreed');
          this.complete();
        }
      );
      if (officePos === 'HK') {
        // 香港モーダル呼び出し
        const parts = agreementHkModalParts();
        parts.payload = { prevPage: previousPage };
        this._modalService.showSubModal(parts);
        // ローディング画面表示終了
        this._pageLoadingService.endLoading();
      } else if (officePos === 'KR') {
        // 韓国モーダル呼び出し
        const parts = agreementKrModalParts();
        parts.payload = { prevPage: previousPage };
        this._modalService.showSubModal(parts);
        // ローディング画面表示終了
        this._pageLoadingService.endLoading();
      }
    } else {
      // 初期表示完了処理へ
      this.complete();
    }
  }

  /**
   * 初期表示完了処理
   */
  complete(): void {
    // オフィス情報を取得する(関連キャッシュ名: m_office)
    const getOfficeInfo = (): any => {
      const mOffice = this._aswMasterSvc.aswMaster?.[MasterStoreKey.OFFICE_ALL];
      const officeInfo = mOffice?.find((officeInfo: any) => {
        return officeInfo.office_code && officeInfo.office_code === this._aswContextSvc.aswContextData.pointOfSaleId;
      });
      return officeInfo || {};
    };
    // 動的文言設定処理
    dynamicSubject.next({
      getPlansReply: this.myPlanList,
      getCartReply: this._currentCartStoreService.CurrentCartData,
      roundtripOwdReply: this._roundtripOwdService.roundtripOwdData,
      fareConditionsReply: undefined,
      pageContext: this.displayInfoJSON,
      dynamicContextOfficeInfo: getOfficeInfo(),
    });
    // 初期表示時分のワーニング表示処理
    this.showInitWarns();
    // 運賃ルール・手荷物情報取得APIの遅延実行
    this.setFareConditionsAfterInit();
    // 初期表示後の画面更新処理を用意
    this.callAfterEvents();
    // 全コンポーネントの初期表示処理が終わり次第、ローディング解除
    this._contService.endInitWhenAllReadyToShow(dynamicSubject.asObservable());
  }

  /**
   * 初期表示完了以降の画面更新処理
   */
  callAfterEvents() {
    this.subscribeService(
      'PlanReviewContComponent refresh',
      this._planReviewStoreService.getPlanReview$().pipe(
        map((store) => store.isNeedRefresh),
        distinctUntilChanged(),
        filter((flag) => !!flag)
      ),
      () => {
        this._planReviewStoreService.updatePlanReview({ isNeedRefresh: false });
        this._pageLoadingService.startLoading();
        this.refresh();
      }
    );
  }

  /**
   * アップセルオファー設定処理
   * @param afterEvent 後続処理
   */
  setUpsellInfo(afterEvent?: () => void): void {
    const cartPlan = this._currentCartStoreService.CurrentCartData.data?.plan;
    // アップセル表示条件を満たす場合、アップセルオファー作成処理を行う
    const isShowUpsell = this._aswMasterSvc.getMPropertyByKey('plan', 'upsell.isShow') === 'true';
    const boundNum = cartPlan?.airOffer?.bounds?.length ?? 0;
    // FY25: FY25で追加となるアップセル表示条件を判定
    // 小児単独判定
    const numberOfTraveler = cartPlan?.travelersSummary?.numberOfTraveler;
    const isChdOnly = (numberOfTraveler?.ADT ?? 0) + (numberOfTraveler?.B15 ?? 0) === 0;
    // 空席待ち便存在しない判定
    const isStatusOther = cartPlan?.airOffer?.statusType === 'other';
    // Bizオフィス判定
    const isBizOffice = this._common.aswContextStoreService.aswContextData.pointOfSaleId === ANA_BIZ_OFFICE_CODE;
    // 国際旅程か否か
    const isInternational = cartPlan?.airOffer?.tripType === 'international';
    // アップセル表示条件を満たすか否か判定
    if (
      isShowUpsell &&
      this.isPlanValid &&
      boundNum <= 2 &&
      !isChdOnly &&
      isStatusOther &&
      !isBizOffice &&
      isInternational
    ) {
      // アップセル適用／キャンセル用関数を設定
      this._upsellService.setUpsellFunctions();

      // アップセルオファー情報・キャンセル情報を取得
      this.subscribeService(
        'PlanReviewContComponent UpsellService',
        this._upsellService.getUpsellInfo(),
        (data) => {
          this.deleteSubscription('PlanReviewContComponent UpsellService');
          const upsellStatus = this._planReviewStoreService.PlanReviewData.upsellStatus;

          // 画面情報JSON
          this.displayInfoJSON = {
            searchCriteria: this._aswPageOutputSearchCriteria,
            Upsell: data,
            isUpsellApplied: upsellStatus.isInboundUpselled || upsellStatus.isOutboundUpselled,
            isPaypalAvailable: this.getPayPalAvailableFlag(),
          };
          // 動的文言
          const dynamicParam: PlanReviewDynamicParams = {
            ...dynamicSubject.getValue(),
            pageContext: this.displayInfoJSON,
          };
          // Tealiumへ連携
          this._contService.addTealiumPageOutput(this.displayInfoJSON);
          dynamicSubject.next(dynamicParam);
          if (afterEvent) {
            afterEvent();
          }
        },
        (error) => {
          const upsellStatus = this._planReviewStoreService.PlanReviewData.upsellStatus;

          // 画面情報JSON
          this.displayInfoJSON = {
            searchCriteria: this._aswPageOutputSearchCriteria,
            isUpsellApplied: upsellStatus.isInboundUpselled || upsellStatus.isOutboundUpselled,
            isPaypalAvailable: this.getPayPalAvailableFlag(),
          };
          // 動的文言
          const dynamicParam: PlanReviewDynamicParams = {
            ...dynamicSubject.getValue(),
            pageContext: this.displayInfoJSON,
          };
          // Tealiumへ連携
          this._contService.addTealiumPageOutput(this.displayInfoJSON);
          dynamicSubject.next(dynamicParam);
          if (afterEvent) {
            afterEvent();
          }
        }
      );
    } else {
      // アップセル表示条件を満たさない場合

      // アップセル適用／キャンセル用関数を削除
      this._upsellService.deleteUpsellFunctions();
      // 画面情報JSON
      this.displayInfoJSON = {
        searchCriteria: this._aswPageOutputSearchCriteria,
        isUpsellApplied: false,
        isPaypalAvailable: this.getPayPalAvailableFlag(),
      };
      // 動的文言
      const dynamicParam: PlanReviewDynamicParams = {
        ...dynamicSubject.getValue(),
        pageContext: this.displayInfoJSON,
      };
      // Tealiumへ連携
      this._contService.addTealiumPageOutput(this.displayInfoJSON);
      dynamicSubject.next(dynamicParam);
      if (afterEvent) {
        afterEvent();
      }
    }
  }

  /**
   * 初期表示時分ワーニング表示処理
   */
  showInitWarns(): void {
    const deliveryData = this._deliveryInfoStoreService.deliveryInformationData;
    const planReviewDeliveryInfo = deliveryData.planReviewInformation ?? {};
    const errInfo = planReviewDeliveryInfo.errInfo;
    // 支払情報入力画面から連携されたエラー情報を表示
    if (errInfo && errInfo?.length > 0) {
      errInfo.forEach((info) => {
        this._errorsHandlerSvc.setRetryableError(PageType.PAGE, info);
      });
    }

    // 空席照会結果画面にてサポート情報が無効となった場合
    const supportRegisterErrorCode = planReviewDeliveryInfo?.supportRegisterErrorCode;
    if (!isStringEmpty(supportRegisterErrorCode)) {
      const alertMessageData: AlertMessageItem = {
        contentHtml: 'E0620',
        isCloseEnable: true,
        alertType: AlertType.WARNING,
        errorMessageId: 'E0620',
        apiErrorCode: supportRegisterErrorCode,
      };
      this._common.alertMessageStoreService.setAlertWarningMessage(alertMessageData);
      // サポート情報が無効となった旨のフラグをリセット
      this._deliveryInfoStoreService.updateDeliveryInformation({
        planReviewInformation: {
          ...planReviewDeliveryInfo,
          supportRegisterErrorCode: undefined,
        },
      });
    }

    // FY25: ペットらくのり画面から連携されたエラー情報を表示
    const svcApplicationErrList = deliveryData.serviceApplication?.errorInfo;
    if (!!svcApplicationErrList?.length) {
      svcApplicationErrList.forEach((error) => this._errorsHandlerSvc.setRetryableError(PageType.PAGE, error));
    }

    // 操作中プランが未保存、かつ保存済みプラン数が上限に達している場合
    const planMax = parseInt(this._aswMasterSvc.getMPropertyByKey('plan', 'maximumSavePlans'), 10);
    const savedPlansNumber = this.myPlanList?.plans?.filter((plan) => !plan.isUnsaved).length ?? 0;
    const isCurrentPlanUnsaved = this._currentPlanStoreService.CurrentPlanData.isUnsaved ?? true;
    if (isCurrentPlanUnsaved && savedPlansNumber >= planMax) {
      const alertMessageData: AlertMessageItem = {
        contentHtml: 'E0372',
        isCloseEnable: true,
        alertType: AlertType.WARNING,
        errorMessageId: 'E0372',
      };
      this._common.alertMessageStoreService.setAlertWarningMessage(alertMessageData);
    }

    //  ユーザ共通.操作オフィスコード=支払不可情報.オフィスとなる、ASWDB(マスタ)の支払不可情報.ユーザーエージェント検索文字列と支払不可情報.ワーニング表示フラグがtrueの支払不可情報.支払方法を取得する。ユーザーエージェントに検索文字列が含まれる場合、”W1862”(利用中のブラウザでは対象の支払方法が使用できないため、推奨ブラウザを使ってほしい旨)のワーニングメッセージを表示する。
    this._getUnavailablePaymentByOfficeCodeService.checkUnavailablePaymentByOfficeCode();
  }

  /**
   * 初期表示完了後 運賃ルール・手荷物情報取得API呼び出し処理
   */
  setFareConditionsAfterInit() {
    // 初期表示完了後に運賃ルール・手荷物情報取得API呼び出し
    this.subscribeService(
      'PlanReviewContComponent isAllReadyToShow',
      this._planReviewStoreService.getPlanReview$().pipe(first((data) => data.isAllReadyToShow)),
      () => {
        this.deleteSubscription('PlanReviewContComponent isAllReadyToShow');
        this.setFareConditions();
      }
    );
  }

  /**
   * 運賃ルール・手荷物情報取得API呼び出し処理
   */
  setFareConditions(): void {
    const request = {
      cartId: this._currentCartStoreService.CurrentCartData.data?.cartId ?? '',
      commonIgnoreErrorFlg: true, // エラーハンドリング回避フラグ
    };
    apiEventAll(
      () => this._fareConditionsStoreService.setFareConditionsFromApi(request),
      this._fareConditionsStoreService.getFareConditions$(),
      (response) => {
        this.fareConditionsResponse = response;
        if (this._hasShowAgreementModal) {
          this._pageLoadingService.endLoading();
        }
        this._changeDetectorRef.markForCheck();
      },
      (error) => {
        this.fareConditionsResponse = error;
        if (this._hasShowAgreementModal) {
          this._pageLoadingService.endLoading();
        }
        this._changeDetectorRef.markForCheck();
      }
    );
  }

  /**
   * 画面情報更新処理
   */
  refresh(): void {
    // 運賃・手荷物パーツを初期化
    this.fareConditionsResponse = undefined;

    // リトリーブ後の処理
    const afterEvent = () => {
      // 運賃・手荷物ルールの再取得
      this.setFareConditions();
      // presComponentの詰めなおし処理呼び出し
      this._presComponent?.refresh();
      this._pageLoadingService.endLoading();
    };

    const cartId = this._currentCartStoreService.CurrentCartData.data?.cartId ?? '';
    // 操作中カートと操作中プランを更新
    this.updateCurrentPlan(cartId, this._common.isNotLogin(), () => {
      this.updateCurrentCart(cartId, afterEvent);
    });
  }

  /**
   * 操作中カート更新処理
   * @param cartId
   * @param afterEvent
   * @returns
   */
  updateCurrentCart(cartId: string, afterEvent: () => void) {
    // カート取得API実行
    const request: PostGetCartRequest = {
      cartId: cartId,
      refresh: true,
      mask: true,
    };
    apiEventAll(
      () => {
        if (!this._getCartStoreService.GetCartData.isPending) {
          this._getCartStoreService.setGetCartFromApi(request);
        }
      },
      this._getCartStoreService.getGetCart$(),
      (response) => {
        // currentCartにレスポンスをセット
        this._currentCartStoreService.setCurrentCart(response);
        // 動的文言
        const dynamicParam: PlanReviewDynamicParams = {
          ...dynamicSubject.getValue(),
          getCartReply: response,
        };
        dynamicSubject.next(dynamicParam);
        // currentCartストア更新完了待ち
        this.subscribeService(
          'PlanReviewContComponent CurrentCart',
          this._currentCartStoreService.getCurrentCart$().pipe(
            delay(500),
            first((store) => !store.isPending)
          ),
          () => {
            this.deleteSubscription('PlanReviewContComponent CurrentCart');
            afterEvent();
          }
        );
      },
      (error) => {
        const apiErr = this._common.apiError?.errors?.[0]?.code ?? '';
        this._contService.handleGetCartError(apiErr);
        this._pageLoadingService.endLoading();
      }
    );
  }

  /**
   * 操作中プラン更新処理
   * @param cartId
   * @param isNotLogin
   * @returns
   */
  updateCurrentPlan(cartId: string, isNotLogin: boolean, afterEvent: () => void) {
    if (isNotLogin) {
      // 未ログイン状態の場合、ローカルプランリストの同IDプランを詰める
      this.myPlanList = this._localPlanService.getLocalPlans();
      this._currentPlanStoreService.setCurrentPlanFromPlanList(cartId, this.myPlanList, () => {
        afterEvent();
      });
    } else {
      // ログイン状態の場合、プランリスト取得APIを実行
      this.setCurrentPlanFromApi(cartId, () => {
        afterEvent();
      });
    }
  }

  /**
   * プランリスト取得APIを呼び出し、操作中プランを更新する処理
   * @param currentCartId
   * @param afterEvent
   */
  setCurrentPlanFromApi(currentCartId: string, afterEvent: () => void) {
    apiEventAll(
      () => this._getPlansStoreService.setGetPlansFromApi({}),
      this._getPlansStoreService.getGetPlans$(),
      (response) => {
        this.myPlanList = { ...response };
        // カートIDがない場合
        if (!currentCartId || currentCartId === '') {
          // 取得0件の場合
          if (!this.myPlanList || this.myPlanList?.plans?.length === 0) {
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.BUSINESS_LOGIC,
              errorMsgId: 'EA030',
            });
            return;
          }
          currentCartId = response.plans?.[0]?.cartId ?? '';
        }
        // 操作中プラン情報を更新
        this._currentPlanStoreService.setCurrentPlanFromPlanList(currentCartId, this.myPlanList);

        // セット完了待ち
        this.subscribeService(
          'PlanReviewContComponent CurrentPlan',
          this._currentPlanStoreService.getCurrentPlan$().pipe(
            delay(500),
            first((store) => !store.isPending)
          ),
          () => {
            this.deleteSubscription('PlanReviewContComponent CurrentPlan');
            afterEvent();
          }
        );
      },
      (error) => {
        const apiErr = this._common.apiError?.errors?.[0]?.code;
        this._errorsHandlerSvc.setNotRetryableError({
          errorType: ErrorType.SYSTEM,
          apiErrorCode: apiErr,
        });
      }
    );
  }

  /**
   * PayPal使用可否
   * @returns
   */
  private getPayPalAvailableFlag(): boolean {
    // ユーザ共通.操作オフィスコード=オフィスコードとなるASWDB(マスタ)のオフィス.ASWTOP識別
    let result = false;
    this._common.aswMasterService
      .getAswMasterByKey$(MasterStoreKey.OFFICE_ALL)
      .pipe(take(1))
      .subscribe((_officeAll) => {
        _officeAll.forEach((officeAll: M_OFFICE) => {
          if (officeAll.office_code === this._common.aswContextStoreService.aswContextData.pointOfSaleId) {
            result = officeAll.paypal_available_flag ?? false;
          }
        });
      });
    return result;
  }

  /**
   * 有効期限切れプランのローカルストレージ削除処理
   */
  private deleteExpiredLocalPlan(): void {
    // ローカルプランリスト取得
    let localPlanList = this._localPlanService.getLocalPlans();
    if (localPlanList) {
      // ローカルプランリストが存在する場合
      // プラン有効期限切れプランを除外
      const newLocalPlanList: Array<PlansGetPlansResponsePlansInner> =
        localPlanList.plans
          ?.filter(
            (localPlan) =>
              (localPlan?.planExpiryDate ?? '') >= (this._datePipe.transform(this.sysDate, 'yyyy-MM-dd') ?? '')
          )
          .map((localPlan) => {
            const newlocal: PlansGetPlansResponsePlansInner = {
              cartId: localPlan.cartId,
              planName: localPlan.planName,
              creationDate: localPlan.creationDate,
              planExpiryDate: localPlan.planExpiryDate,
              planLastModificationDate: localPlan?.planLastModificationDate,
              prebookExpiryDate: localPlan.prebookExpiryDate,
              isUnsaved: localPlan.isUnsaved,
              isPrebooked: localPlan.isPrebooked,
              creationPointOfSaleId: localPlan.creationPointOfSaleId,
            };
            return newlocal;
          }) ?? [];
      const newLocalPlans: PlansGetPlansResponse = {
        plans: newLocalPlanList,
      };
      this._localPlanService.setLocalPlans(newLocalPlans);
    }
  }

  destroy(): void {
    // アップセル適用／キャンセル用関数を削除
    // this._upsellService.deleteUpsellFunctions();
  }

  reload(): void {}
}
