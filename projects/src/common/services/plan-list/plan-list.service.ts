import { Injectable } from '@angular/core';
import { apiEventAll } from '@common/helper';
import {
  CreatePlansStoreService,
  DeletePlansStoreService,
  LocalPlanService,
  PlanListStoreService,
} from '@common/services';
import { CreatePlansState, PlanListModel } from '@common/store';
import { AmcLoginHeaderComponent } from '@lib/components/shared-ui-components/amc-login/amc-login-header.component';
import { AmcLoginComponent } from '@lib/components/shared-ui-components/amc-login/amc-login.component';
import { SupportClass } from '@lib/components/support-class';
import { ErrorType, LoginStatusType, PageType } from '@lib/interfaces';
import {
  AswMasterService,
  CommonLibService,
  ErrorsHandlerService,
  ModalService,
  PageLoadingService,
} from '@lib/services';
import {
  Bound,
  PlansCreatePlansRequest,
  PlansCreatePlansRequestPlansInner,
  PlansDeletePlansRequest,
  PlansGetPlansResponse,
  PlansGetPlansResponsePlansInner,
  PostGetCartResponse,
  PostGetCartResponseData,
} from 'src/sdk-reservation';
import {
  PlanListMAirportI18nList,
  PlanListBoundReturn,
  PlanListNumPerType,
  PlanListProcessType,
  PlanListQueryParam,
  PlanListPassengerInfo,
  PlanListDiffInfo,
  PlanListSegmentInfo,
  PlanListDiffFlg,
  PlanListCurrentCart,
  PlanListCurrentPlan,
  PlanListSelect,
} from '@common/interfaces';
import { MergeConfirmModalPayloadParts } from '@app/plan-list/sub-components/modal/merge-confirm-modal/merge-confirm-modal-payload.state';
import { temporaryUrlModalParts } from '@common/components/reservation/other/temporary-url-modal/temporary-url-modal.state';
import { ReturnStatement } from '@angular/compiler';
import { AmcLoginPayload } from '@lib/components/shared-ui-components/amc-login/amc-login.state';
import { ErrorCodeConstants } from '@conf/app.constants';

//translateキー
const TRANSLATE_KEY = {
  M_AIRPORT_I18N: 'm_airport_i18n_',
} as const;

//プロパティ情報
const M_PROPERTY_INFO = {
  category: 'plan',
  key: 'url.planList',
};

@Injectable({
  providedIn: 'root',
})
export class PlanListService extends SupportClass {
  /**
   * コンストラクタ
   */
  constructor(
    private _common: CommonLibService,
    private _masterSvc: AswMasterService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _modalService: ModalService,
    private _deletePlanStoreService: DeletePlansStoreService,
    private _createPlansStoreService: CreatePlansStoreService,
    private _localPlanService: LocalPlanService,
    private _planListStoreService: PlanListStoreService,
    private _pageLoadingService: PageLoadingService
  ) {
    super();
  }

  /* ログインステータス */
  loginStatus: string = this._common.aswContextStoreService.aswContextData.loginStatus;
  /* 空港(国際化)キャッシュ情報 */
  public mAirportI18nList: PlanListMAirportI18nList = {};
  /* 削除対象プランリスト */
  deletePlanList: Array<PlansGetPlansResponsePlansInner> = [];

  destroy(): void {}

  /**
   * 必要なキャッシュを取得する
   * @param event キャッシュ取得後処理
   */
  getCacheMaster(event: (master: PlanListMAirportI18nList) => void) {
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    const langPrefix = '/' + lang;
    this.subscribeService(
      'PlanListComponent getAswMasterByKeyObservable m_airport_i18n',
      this._masterSvc.load([{ key: 'm_airport_i18n' + `_${lang}`, fileName: 'm_airport_i18n' + langPrefix }], true),
      ([airport]) => {
        this.mAirportI18nList = airport;
        event(this.mAirportI18nList);
      }
    );
  }

  /* 表示用カートリスト初期化 */
  setInitialCurrentCart() {
    const currentCartInitial: PlanListCurrentCart = {
      cartId: '',
      isValid: false,
      isChangedPlan: false,
      isDelayed: false,
      isEarlyFlight: false,
      boundList: [],
      curPassenger: {},
      prePassenger: {},
      curCurrencyCode: '',
      preCurrencyCode: '',
      isDiff: false,
      diffTotalPrice: false,
    };
    return currentCartInitial;
  }

  // プラン選択チェックボックス初期化
  setInitialStateselect() {
    const planListSelectInitialState: PlanListSelect = {
      index: 0,
      name: '',
      checked: false,
      cartId: '',
    };
    return planListSelectInitialState;
  }

  // 差分強調初期化
  setInitialStatePlanListDiffFlg() {
    const planListDiffFlgInitialState: PlanListDiffFlg = {
      diffDep: false,
      diffDepEst: false,
      diffArv: false,
      diffArvEst: false,
      arvDayDiff: false,
      diffBaggage: false,
      diffLounge: false,
      diffMeal: false,
    };
    return planListDiffFlgInitialState;
  }

  /* カート情報作成処理 */
  createCartInformation(plan: PlansGetPlansResponsePlansInner, cartResponse?: PostGetCartResponse) {
    let currentCart: PlanListCurrentCart = this.setInitialCurrentCart();

    if (cartResponse?.data) {
      const cartData = cartResponse?.data;

      // プラン有効/無効判定
      const isValid = cartData.plan !== undefined;

      // 搭乗者情報
      const passengerInfo: PlanListPassengerInfo = this.getPassengerCount(cartData, isValid);

      // バウンドループ実装
      const currentBoundList = this.createBoundsInformation(cartData, isValid);

      // 差分強調表示凡例判定
      const boundDiff = currentBoundList.some((bound) => bound.isDiff);
      const priceDiff = this.getPriceInfo(cartData, isValid);

      // 新リターンカートリスト
      currentCart = {
        cartId: plan.cartId ?? '',
        isValid: isValid,
        isChangedPlan: JSON.stringify(cartData.plan) !== JSON.stringify(cartData.previousPlan),
        isDelayed: currentBoundList.some((bound) => bound.isDelayed),
        isEarlyFlight: currentBoundList.some((bound) => bound.isEarly),
        boundList: currentBoundList,
        curPassenger: passengerInfo.curPassenger ?? {},
        prePassenger: passengerInfo.prePassenger ?? {},
        curTotalPrice: cartData?.plan?.prices?.totalPrices?.total?.value,
        preTotalPrice: cartData?.previousPlan?.prices?.totalPrices?.total?.value,
        curCurrencyCode: cartData?.plan?.prices?.totalPrices?.total?.currencyCode ?? '',
        preCurrencyCode: cartData?.previousPlan?.prices?.totalPrices?.total?.currencyCode ?? '',
        diffTotalPrice: priceDiff,
        isDiff: boundDiff || priceDiff,
        cartData: cartResponse,
      };
    }
    return currentCart;
  }

  /* 支払情報取得 */
  getPriceInfo(cartData: PostGetCartResponseData, isValid: boolean) {
    const currentPrice = cartData?.plan?.prices?.totalPrices?.total?.value ?? 0;
    const previousPrice = cartData?.previousPlan?.prices?.totalPrices?.total?.value ?? 0;

    let diffTotalPrice: boolean = false;
    if (isValid) {
      // 差分強調
      if (currentPrice !== previousPrice) {
        diffTotalPrice = true;
      }
    }

    return diffTotalPrice;
  }

  /* 搭乗者情報取得 */
  getPassengerCount(cartData: PostGetCartResponseData, isValid: boolean) {
    const curNumPerType: PlanListNumPerType = {};
    const preNumPerType: PlanListNumPerType = {};

    // 搭乗者種別ごとの人数
    curNumPerType.ADT = cartData?.plan?.travelersSummary?.numberOfTraveler?.ADT;
    curNumPerType.B15 = cartData?.plan?.travelersSummary?.numberOfTraveler?.B15;
    curNumPerType.CHD = cartData?.plan?.travelersSummary?.numberOfTraveler?.CHD;
    curNumPerType.INF = cartData?.plan?.travelersSummary?.numberOfTraveler?.INF;

    preNumPerType.ADT = cartData?.previousPlan?.travelersSummary?.numberOfTraveler?.ADT;
    preNumPerType.B15 = cartData?.previousPlan?.travelersSummary?.numberOfTraveler?.B15;
    preNumPerType.CHD = cartData?.previousPlan?.travelersSummary?.numberOfTraveler?.CHD;
    preNumPerType.INF = cartData?.previousPlan?.travelersSummary?.numberOfTraveler?.INF;

    let diffPassenger: boolean = false;
    if (isValid) {
      // 搭乗者人数差分
      if (
        curNumPerType.ADT !== preNumPerType.ADT ||
        curNumPerType.B15 !== preNumPerType.B15 ||
        curNumPerType.CHD !== preNumPerType.CHD ||
        curNumPerType.INF !== preNumPerType.INF
      ) {
        diffPassenger = true;
      }
    }
    const passengerInfo: PlanListPassengerInfo = {
      curPassenger: curNumPerType,
      prePassenger: preNumPerType,
      diffPassenger: diffPassenger,
    };

    return passengerInfo;
  }

  /* バウンド情報作成処理 */
  public createBoundsInformation(planList: PostGetCartResponseData, isValid: boolean) {
    const currentBound = planList.plan?.airOffer?.bounds ?? [];
    const previousBound = planList.previousPlan?.airOffer?.bounds ?? [];
    const outBound = isValid ? currentBound : previousBound;
    let boundReturn: Array<PlanListBoundReturn> = [];
    let isContainedDelayedFlight: boolean = false;
    let isContainedEarlyDepartureFlight: boolean = false;

    for (let i = 0; i < outBound.length; i++) {
      let isLateNightDeparture: boolean = false;

      // 遅延便識別子
      if (outBound[i].isContainedDelayedFlight) {
        isContainedDelayedFlight = true;
      }

      // 早発便識別子
      if (outBound[i].isContainedEarlyDepartureFlight) {
        isContainedEarlyDepartureFlight = true;
      }

      // 深夜表記判定
      const lang = this._common.aswContextStoreService.aswContextData.lang;
      if (
        (lang === 'ja' || lang === 'zh' || lang === 'ko') &&
        (outBound[i].flights?.[0].isLateNightDeparture ?? false)
      ) {
        isLateNightDeparture = true;
      }

      //出発空港・到着空港
      const curAirportInfo: Array<string> = currentBound[i]
        ? this.getAirportInfo(currentBound[i], this.mAirportI18nList)
        : [];
      const preAirportInfo: Array<string> = previousBound[i]
        ? this.getAirportInfo(previousBound[i], this.mAirportI18nList)
        : [];

      // 便名
      const segInfo = this.getSegmentinfo(outBound[i], currentBound[i], previousBound[i], isValid);

      // サービス情報
      const serviceInfo = this.getServiceInfo(planList, isValid, i);

      // 差分強調
      let diffInfo: PlanListDiffInfo = {};
      if (isValid) {
        // 差分情報取得処理
        diffInfo = this.getDiffInfo(planList, isValid, i);
      }

      // 最新発着時刻
      const curDepEst = currentBound[i] ? currentBound[i].originDepartureEstimatedDateTime : undefined;
      const preDepEst = previousBound[i] ? previousBound[i].originDepartureEstimatedDateTime : undefined;
      const curArvEst = currentBound[i] ? currentBound[i].destinationArrivalEstimatedDateTime : undefined;
      const preArvEst = previousBound[i] ? previousBound[i].destinationArrivalEstimatedDateTime : undefined;

      boundReturn.push({
        curDep: currentBound[i] ? currentBound[i].originDepartureDateTime : undefined,
        preDep: previousBound[i] ? previousBound[i].originDepartureDateTime : undefined,
        curDepEst: curDepEst,
        preDepEst: preDepEst,
        curDepAirportName: curAirportInfo[0] !== '' ? curAirportInfo[0] : undefined,
        preDepAirportName: preAirportInfo[0] !== '' ? preAirportInfo[0] : undefined,
        curArv: currentBound[i] ? currentBound[i].destinationArrivalDateTime : undefined,
        preArv: previousBound[i] ? previousBound[i].destinationArrivalDateTime : undefined,
        curArvEst: curArvEst,
        preArvEst: preArvEst,
        curDayDiff: this.getDaysDifferenceLabel(
          (currentBound[i] ? currentBound[i].destinationArrivalDaysDifference : undefined) ?? 0
        ),
        curDayDiffMinusOne:
          ((currentBound[i] ? currentBound[i].destinationArrivalDaysDifference : undefined) ?? 0) === -1,
        preDayDiff: this.getDaysDifferenceLabel(
          (previousBound[i] ? previousBound[i].destinationArrivalDaysDifference : undefined) ?? 0
        ),
        preDayDiffMinusOne:
          ((previousBound[i] ? previousBound[i].destinationArrivalDaysDifference : undefined) ?? 0) === -1,
        curArvAirportName: curAirportInfo[1] !== '' ? curAirportInfo[1] : undefined,
        preArvAirportName: preAirportInfo[1] !== '' ? preAirportInfo[1] : undefined,
        segment: segInfo.segment ?? [],
        isDelayed: isContainedDelayedFlight,
        isEarly: isContainedEarlyDepartureFlight,
        isBaggage: serviceInfo.isBaggage,
        isLounge: serviceInfo.isLounge,
        isMeal: serviceInfo.isMeal,
        isDepertureEstimate: (curDepEst || preDepEst) !== '' ?? false,
        isArrivalEstimate: (curArvEst || preArvEst) !== '' ?? false,
        isLateNightDeparture: isLateNightDeparture,
        diffFlg: diffInfo.diffFlg ?? this.setInitialStatePlanListDiffFlg(),
        isDiff: diffInfo.isDiff ?? false,
      });
    }
    return boundReturn;
  }

  /* セグメント情報作成処理 */
  getSegmentinfo(outBound: Bound, curBound: Bound, preBound: Bound, isValid: boolean) {
    let segmentInfo: PlanListSegmentInfo = {};
    segmentInfo.segment = outBound.flights?.map((flight, index: number) => {
      const curFlightNo = curBound
        ? (curBound.flights?.[index]?.marketingAirlineCode ?? '') +
          (curBound.flights?.[index]?.marketingFlightNumber ?? '')
        : undefined;
      const preFlightNo = preBound
        ? (preBound.flights?.[index]?.marketingAirlineCode ?? '') +
          (preBound.flights?.[index]?.marketingFlightNumber ?? '')
        : undefined;
      return {
        curflightName: curFlightNo !== '' ? curFlightNo : undefined,
        preflightName: preFlightNo !== '' ? preFlightNo : undefined,
      };
    });

    return segmentInfo;
  }

  /* サービス情報取得処理 */
  getServiceInfo(planList: PostGetCartResponseData, isValid: boolean, i: number) {
    const currentCart = planList.plan ?? {};
    const previousCart = planList.previousPlan ?? {};
    const currentBound = planList.plan?.airOffer?.bounds ?? [];
    const previousBound = planList.previousPlan?.airOffer?.bounds ?? [];
    let isBaggage: boolean = false;
    let isLounge: boolean = false;
    let isMeal: boolean = false;

    if (isValid) {
      if (currentBound[i] && previousBound[i]) {
        if (currentBound[i].airBoundId) {
          const preIndex = previousCart.airOffer?.bounds?.findIndex(
            (preBound) => currentBound[i].airBoundId === preBound.airBoundId
          );
          if (preIndex !== undefined) {
            const curBaggage =
              currentCart.chargeableAncillarySummary?.[currentBound[i].airBoundId ?? '']?.firstBaggage
                ?.numberOfRequests ?? 0;
            const preBaggage =
              previousCart.chargeableAncillarySummary?.[previousBound[preIndex].airBoundId ?? '']?.firstBaggage
                ?.numberOfRequests ?? 0;
            const curLounge =
              currentCart.chargeableAncillarySummary?.[currentBound[i].airBoundId ?? '']?.lounge?.numberOfRequests ?? 0;
            const preLounge =
              previousCart.chargeableAncillarySummary?.[previousBound[preIndex].airBoundId ?? '']?.lounge
                ?.numberOfRequests ?? 0;
            const curMeal =
              currentCart.chargeableAncillarySummary?.[currentBound[i].airBoundId ?? '']?.meal?.numberOfRequests ?? 0;
            const preMeal =
              previousCart.chargeableAncillarySummary?.[previousBound[preIndex].airBoundId ?? '']?.meal
                ?.numberOfRequests ?? 0;

            isBaggage = curBaggage !== 0 || preBaggage !== 0;
            isLounge = curLounge !== 0 || preLounge !== 0;
            isMeal = curMeal !== 0 || preMeal !== 0;
          }
        }
      } else if (currentBound[i] && !previousBound[i]) {
        isBaggage =
          (currentCart.chargeableAncillarySummary?.[currentBound[i].airBoundId ?? ''].firstBaggage?.numberOfRequests ??
            0) !== 0;
        isLounge =
          (currentCart.chargeableAncillarySummary?.[currentBound[i].airBoundId ?? ''].lounge?.numberOfRequests ?? 0) !==
          0;
        isMeal =
          (currentCart.chargeableAncillarySummary?.[currentBound[i].airBoundId ?? ''].meal?.numberOfRequests ?? 0) !==
          0;
      }
    } else {
      isBaggage =
        (previousCart.chargeableAncillarySummary?.[previousBound[i].airBoundId ?? ''].firstBaggage?.numberOfRequests ??
          0) !== 0;
      isLounge =
        (previousCart.chargeableAncillarySummary?.[previousBound[i].airBoundId ?? ''].lounge?.numberOfRequests ?? 0) !==
        0;
      isMeal =
        (previousCart.chargeableAncillarySummary?.[previousBound[i].airBoundId ?? ''].meal?.numberOfRequests ?? 0) !==
        0;
    }

    return {
      isBaggage: isBaggage,
      isLounge: isLounge,
      isMeal: isMeal,
    };
  }

  /* 到着日付差ラベル取得処理 */
  getDaysDifferenceLabel(daysDifference: number) {
    let daysDifferenceLabel: string = '';
    switch (daysDifference) {
      case -1:
        daysDifferenceLabel = 'label.dayMinusOne';
        break;
      case 1:
        daysDifferenceLabel = 'label.dayPlusOne';
        break;
      case 2:
        daysDifferenceLabel = 'label.dayPlusTwo';
        break;
      default:
        break;
    }
    return daysDifferenceLabel;
  }

  /* 差分取得処理 */
  getDiffInfo(planList: PostGetCartResponseData, isValid: boolean, i: number) {
    let diffInfo: PlanListDiffInfo = {};

    // 発着差分取得
    const diffDepArv = this.getDepArvDiff(planList, i);

    // サービス差分取得
    const serviceDiff = this.getServiceDiff(planList, isValid, i);

    // 差分強調
    diffInfo.diffFlg = {
      diffDep: diffDepArv.diffDep,
      diffDepEst: diffDepArv.diffDepEst,
      diffArv: diffDepArv.diffArv,
      diffArvEst: diffDepArv.diffArvEst,
      arvDayDiff: diffDepArv.arvDayDiff,
      diffBaggage: serviceDiff.diffBaggage,
      diffLounge: serviceDiff.diffLounge,
      diffMeal: serviceDiff.diffMeal,
    };
    if (
      diffDepArv.diffDep ||
      diffDepArv.diffDepEst ||
      diffDepArv.diffArv ||
      diffDepArv.diffArvEst ||
      serviceDiff.diffBaggage ||
      serviceDiff.diffLounge ||
      serviceDiff.diffMeal
    ) {
      diffInfo.isDiff = true;
    }

    return diffInfo;
  }

  /* 発着地差分取得処理 */
  getDepArvDiff(planList: PostGetCartResponseData, i: number) {
    const currentBound = planList.plan?.airOffer?.bounds ?? [];
    const previousBound = planList.previousPlan?.airOffer?.bounds ?? [];
    const diffFlg: PlanListDiffFlg = this.setInitialStatePlanListDiffFlg();

    if (currentBound[1] && previousBound[i]) {
      const curDeoTime = currentBound?.[i]?.originDepartureDateTime ?? '';
      const prevDepTime = previousBound?.[i].originDepartureDateTime ?? '';
      const curDepEst = currentBound?.[i]?.originDepartureEstimatedDateTime ?? '';
      const prevDepEst = previousBound?.[i].originDepartureEstimatedDateTime ?? '';
      const curArvTime = currentBound?.[i]?.destinationArrivalDateTime;
      const prevArvTime = previousBound?.[i].destinationArrivalDateTime;
      const curArvEst = currentBound?.[i]?.destinationArrivalEstimatedDateTime;
      const prevArvEst = previousBound?.[i].destinationArrivalEstimatedDateTime;
      diffFlg.arvDayDiff =
        currentBound?.[i]?.destinationArrivalDaysDifference !== previousBound?.[i].destinationArrivalDaysDifference ??
        false;

      // 発着差分有無
      if (curDeoTime !== prevDepTime) {
        diffFlg.diffDep = true;
      }
      if (curDepEst !== prevDepEst) {
        diffFlg.diffDepEst = true;
      }
      if (curArvTime !== prevArvTime) {
        diffFlg.diffArv = true;
      }
      if (curArvEst !== prevArvEst) {
        diffFlg.diffArvEst = true;
      }
    } else if (currentBound[1] && !previousBound[i]) {
      diffFlg.arvDayDiff = true;
      diffFlg.diffDep = true;
      diffFlg.diffDepEst = true;
      diffFlg.diffArv = true;
      diffFlg.diffArvEst = true;
    }

    return diffFlg;
  }

  /* サービス差分取得処理 */
  getServiceDiff(planList: PostGetCartResponseData, isValid: boolean, i: number) {
    const currentCart = planList.plan ?? {};
    const previousCart = planList.previousPlan ?? {};
    const currentBound = planList.plan?.airOffer?.bounds ?? [];
    const previousBound = planList.previousPlan?.airOffer?.bounds ?? [];

    const diffFlg: PlanListDiffFlg = this.setInitialStatePlanListDiffFlg();

    if (currentBound[i] && previousBound[i]) {
      if (currentBound[i].airBoundId) {
        const preIndex = previousCart.airOffer?.bounds?.findIndex(
          (preBound) => currentBound[i].airBoundId === preBound.airBoundId
        );
        if (preIndex !== undefined) {
          const curBaggage =
            currentCart.chargeableAncillarySummary?.[currentBound[i].airBoundId ?? '']?.firstBaggage
              ?.numberOfRequests ?? 0;
          const preBaggage =
            previousCart.chargeableAncillarySummary?.[previousBound[preIndex].airBoundId ?? '']?.firstBaggage
              ?.numberOfRequests ?? 0;
          const curLounge =
            currentCart.chargeableAncillarySummary?.[currentBound[i].airBoundId ?? '']?.lounge?.numberOfRequests ?? 0;
          const preLounge =
            previousCart.chargeableAncillarySummary?.[previousBound[preIndex].airBoundId ?? '']?.lounge
              ?.numberOfRequests ?? 0;
          const curMeal =
            currentCart.chargeableAncillarySummary?.[currentBound[i].airBoundId ?? '']?.meal?.numberOfRequests ?? 0;
          const preMeal =
            previousCart.chargeableAncillarySummary?.[previousBound[preIndex].airBoundId ?? '']?.meal
              ?.numberOfRequests ?? 0;

          diffFlg.diffBaggage = curBaggage === 0 ? curBaggage !== preBaggage : preBaggage === 0 ? true : false;
          diffFlg.diffLounge = curLounge === 0 ? curLounge !== preLounge : preLounge === 0 ? true : false;
          diffFlg.diffMeal = curMeal === 0 ? curMeal !== preMeal : preMeal === 0 ? true : false;
        }
      }
    } else if (currentBound[i] && !previousBound[i]) {
      diffFlg.diffBaggage = true;
      diffFlg.diffLounge = true;
      diffFlg.diffMeal = true;
    }

    return diffFlg;
  }

  /* プランリスト取得APIエラーメッセージ取得処理 */
  getErrorMessage(apiErr: string) {
    let errMsg: string = '';
    switch (apiErr) {
      case ErrorCodeConstants.ERROR_CODES.ECLZ000001:
        errMsg = 'E0365';
        break;
      case ErrorCodeConstants.ERROR_CODES.ECLZ000002:
        errMsg = 'E0365';
        break;
      case ErrorCodeConstants.ERROR_CODES.ECLZ000003:
        errMsg = 'E0365';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000287:
        errMsg = 'E0367';
        break;
      case ErrorCodeConstants.ERROR_CODES.EBAZ000286:
        errMsg = 'E0368';
        break;
      default:
        break;
    }
    return errMsg;
  }

  // memo:AMCログイン後プランマージ処理追加時に使用
  /* プラン作成API逐次処理1 */
  public createPlanCall() {
    const currentPlanList = this._planListStoreService.PlanListData.planList;
    if (currentPlanList && currentPlanList?.length !== 0) {
      let plans: Array<PlansCreatePlansRequestPlansInner> = [];
      this.createPlanCallMain(plans, currentPlanList, 0, (request) => {
        // プラン作成API実行
        this.createPlansAPI(request, (response) => {
          this.afterCreatePlansAPI(response);
        });
      });
    }
  }

  /* プラン作成API逐次処理2 */
  public createPlanCallMain(
    repuestPlans: Array<PlansCreatePlansRequestPlansInner>,
    currentPlan: Array<PlanListCurrentPlan>,
    index: number,
    next: (requestParameter: PlansCreatePlansRequest) => void
  ) {
    const plan: PlansCreatePlansRequestPlansInner = {
      cartId: currentPlan[index].cartId,
      planName: currentPlan[index].planName,
      isUnsaved: currentPlan[index].planData?.isUnsaved,
      creationPointOfSaleId: currentPlan[index].planData?.creationPointOfSaleId,
    };
    repuestPlans.push(plan);

    const requestParameter: PlansCreatePlansRequest = {
      plans: repuestPlans,
      processType: PlanListProcessType.MERGE,
    };

    if (index + 1 === currentPlan.length) {
      next(requestParameter);
    } else {
      this.createPlanCallMain(repuestPlans, currentPlan, index + 1, next);
    }
  }

  /** プラン作成API実行処理 */
  createPlansAPI(param: PlansCreatePlansRequest, next: (response: CreatePlansState) => void) {
    apiEventAll(
      () => {
        this._createPlansStoreService.setCreatePlansFromApi(param);
      },
      this._createPlansStoreService.getCreatePlans$(),
      (response) => {
        this.deleteSubscription('PlanListService createPlans');
        next(response);
      },
      (error) => {
        this.deleteSubscription('PlanListService createPlans');
        const apiErr = this._common.apiError?.errors?.[0]?.code ?? '';
        if (apiErr === ErrorCodeConstants.ERROR_CODES.EBAZ000278) {
          this._errorsHandlerSvc.setNotRetryableError({
            errorType: ErrorType.BUSINESS_LOGIC,
            errorMsgId: 'E0333',
            apiErrorCode: apiErr,
          });
        } else if (apiErr === ErrorCodeConstants.ERROR_CODES.EBAZ000285) {
          this._errorsHandlerSvc.setRetryableError(PageType.PAGE, {
            errorMsgId: 'E0387',
            params: {
              key: 0,
              value: param.plans.length ?? 0,
            },
          });

          const updateParam: PlanListModel = {
            planList: this._planListStoreService.PlanListData.planList,
            isChangePlanList: true,
          };
          this._planListStoreService.updatePlanList(updateParam);
        }
      }
    );
  }

  /* 他端末引継ぎURLモーダル表示処理 */
  openTemporaryUrlModal(response: CreatePlansState) {
    // プロパティキーからURL作成
    let originString = this._masterSvc.getMPropertyByKey(M_PROPERTY_INFO.category, M_PROPERTY_INFO.key);
    const tempUrl = new URL(originString);
    tempUrl.searchParams.append(PlanListQueryParam.TEMP, response.temporaryNumber ?? '');
    const part = temporaryUrlModalParts();
    part.payload = {
      type: 'MIG',
      url: tempUrl.toString(),
    };
    this._modalService.showSubModal(part);
  }

  /** プラン作成API実行後処理 */
  afterCreatePlansAPI(response: CreatePlansState) {
    if (response.warnings?.length !== 0) {
      // ワーニングがある場合、継続可能エラー
      this._errorsHandlerSvc.setRetryableError(PageType.PAGE, {
        errorMsgId: 'E0387',
        params: {
          key: 0,
          value: response.exceededCartIds?.length ?? 0,
        },
      });
    }

    // ローカルプランリスト取得
    const localPlanList = this._localPlanService.getLocalPlans();
    if (localPlanList) {
      // ローカルプランが存在した場合、マージ完了プランをローカルプランリストから除外
      let newLocalPlanList: PlansGetPlansResponse = {};
      const newLocalPlan = localPlanList.plans?.filter(
        (plan) => !response.successedCartIds?.some((successedCartId) => plan.cartId === successedCartId)
      );
      newLocalPlanList.plans = newLocalPlan;
      this._localPlanService.setLocalPlans(newLocalPlanList);
    }

    // マージ識別子設定処理
    const newCurrentPlanList: Array<PlanListCurrentPlan> = this.setMergeFlg(response);

    const param: PlanListModel = {
      planList: newCurrentPlanList,
      isChangePlanList: true,
    };
    this._planListStoreService.updatePlanList(param);
  }

  /* マージ識別子設定処理 */
  setMergeFlg(response: CreatePlansState) {
    // マージ識別子をつける
    const currentPlanList = this._planListStoreService.PlanListData.planList;
    let newCurrentPlanList: Array<PlanListCurrentPlan> = [];
    newCurrentPlanList =
      currentPlanList?.filter(
        (plan: PlanListCurrentPlan) =>
          !response.successedCartIds?.some((successedCartId) => plan.cartId === successedCartId)
      ) ?? [];
    response.successedCartIds?.map((successedCartId) => {
      currentPlanList?.map((plan: PlanListCurrentPlan) => {
        if (plan.cartId === successedCartId) {
          const mergePlan: PlanListCurrentPlan = {
            cartId: plan.cartId,
            isValid: plan.isValid,
            isMerged: true,
            planName: plan.planName,
            createOn: plan.createOn,
            saveUntil: plan.saveUntil,
            cartList: plan.cartList,
            planData: plan.planData,
            finishGetCart: plan.finishGetCart,
          };
          newCurrentPlanList.push(mergePlan);
        }
      });
    });

    // createOnの降順に並び替え
    newCurrentPlanList = newCurrentPlanList.sort(
      (a, b) => new Date(b.createOn).getTime() - new Date(a.createOn).getTime()
    );

    return newCurrentPlanList;
  }

  /* プラン削除API処理 */
  deletePlans(param: PlansDeletePlansRequest, next?: () => void, isNotLoading?: boolean) {
    if (!isNotLoading) {
      this._pageLoadingService.startLoading();
    }
    apiEventAll(
      () => {
        this._deletePlanStoreService.setDeletePlansFromApi(param);
      },
      this._deletePlanStoreService.getDeletePlans$(),
      (response) => {
        if (!isNotLoading) {
          this._pageLoadingService.endLoading();
        }
        this.deleteSubscription('PlanListService deletePlans');
        if (next) {
          next();
        }
      },
      (error) => {
        if (!isNotLoading) {
          this._pageLoadingService.endLoading();
        }
        this.deleteSubscription('PlanListService deletePlans');
        this.deletePlansApiError();
      }
    );
  }

  /* プラン削除APIエラーレスポンス処理 */
  deletePlansApiError(): void {
    const apiErr: string = this._common.apiError?.errors?.at(0)?.code ?? '';
    if (apiErr !== '') {
      this._errorsHandlerSvc.setNotRetryableError({
        errorType: ErrorType.BUSINESS_LOGIC,
        errorMsgId: 'E0333',
        apiErrorCode: apiErr,
      });
    }
  }

  /**
   * 空港名称取得処理
   * @returns Promise<string>
   */
  public getAirportInfo(bounds: Bound, mAirportList: PlanListMAirportI18nList): Array<string> {
    //キャッシュキー
    const departureAirportKey = TRANSLATE_KEY.M_AIRPORT_I18N + bounds.originLocationCode;
    const arrivalAirportKey = TRANSLATE_KEY.M_AIRPORT_I18N + bounds.destinationLocationCode;

    //インデックス0：出発空港、インデックス1：到着空港
    let airportName: Array<string> = [];

    //出発空港名：キャッシュから名称が取得できれば取得値 そうでなければAPIの返却値
    if (departureAirportKey in mAirportList) {
      airportName[0] = mAirportList[departureAirportKey];
    } else {
      airportName[0] = bounds.originLocationName ?? '';
    }
    //到着空港名：キャッシュから名称が取得できれば取得値 そうでなければAPIの返却値
    if (arrivalAirportKey in mAirportList) {
      airportName[1] = mAirportList[arrivalAirportKey];
    } else {
      airportName[1] = bounds.destinationLocationName ?? '';
    }
    return airportName;
  }

  /* AMCログインモーダル表示処理 */
  amcLoginModal(submitEvent: () => void) {
    const closeEvent = () => {
      this._common.errorsHandlerService.setNotRetryableError({
        errorType: ErrorType.BUSINESS_LOGIC,
        errorMsgId: 'E1833',
      });
    };
    const payload: AmcLoginPayload = {
      submitEvent: submitEvent,
      closeEvent: closeEvent,
    };
    const diarogPart = this._modalService.defaultIdPart(AmcLoginComponent, AmcLoginHeaderComponent);
    diarogPart.closeBackEnable = true;
    const parts = {
      ...diarogPart,
      payload: payload,
    };
    this._modalService.showSubPageModal(parts);
  }

  /** マージ確認モーダル表示処理 */
  openMerge() {
    const part = MergeConfirmModalPayloadParts();
    this._modalService.showSubModal(part);
  }
}
