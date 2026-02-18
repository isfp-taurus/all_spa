import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { PlanReviewPresMasterData } from '../../presenter/plan-review-pres.component.state';
import {
  getAirportNameFromCache,
  getKeyListData,
  getPaxName,
  isEmptyObject,
  isStringEmpty,
  string8ToDate,
} from '@common/helper';
import {
  PassengerType,
  RamlServicesBaggageFirst,
  RamlServicesBaggageFirstSegmentMain,
  RamlServicesLounge,
  RamlServicesLoungeIdInfoMain,
  RamlServicesMeal,
  RamlServicesMealPassenger,
  RamlServicesMealPassengerAppliedMeal,
  PlanReviewOutputPetInfo,
  PlanReviewOutputPetInfoPassengerSegInfo,
  PlanReviewServiceDisplayState,
  PlanReviewOutputFBagInfo,
  PlanReviewOutputLoungeInfo,
  PlanReviewOutputMealInfo,
  MealApplicationState,
  MListData,
} from '@common/interfaces';
import { CurrentCartStoreService, DiffEmphService } from '@common/services';
import { SupportComponent } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService, SystemDateService } from '@lib/services';
import { BehaviorSubject } from 'rxjs';
import { first } from 'rxjs/operators';
import { BoundFlightsInner, CreateCartResponseDataPlanServicesPet } from 'src/sdk-reservation';
import { PlanReviewServicePartsService } from './plan-review-service-parts.service';

/**
 * サービス(パーツ)
 */
@Component({
  selector: 'asw-service-part',
  templateUrl: './plan-review-service-parts.component.html',
  styleUrls: ['./plan-review-service-parts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewServicePartsComponent extends SupportComponent {
  /** 取得したマスタデータ */
  @Input() set masterData(value: PlanReviewPresMasterData | undefined) {
    this._masterData = value;
    this._isMasterDataSetSbj.next(!!this._masterData);
  }
  get masterData(): PlanReviewPresMasterData | undefined {
    return this._masterData;
  }
  private _masterData?: PlanReviewPresMasterData;

  /** マスタデータset状況判定用Subject */
  private _isMasterDataSetSbj = new BehaviorSubject<boolean>(false);

  /** プラン有効判定 */
  public isPlanValid = false;

  /** 初期表示準備完了EventEmitter */
  @Output() readyToShow = new EventEmitter();

  /** 初期表示準備完了フラグ */
  public isShow = false;

  /** 通貨フォーマット */
  public currencyCode: string | undefined;

  /** 事前追加手荷物最安金額 */
  public baggageMin?: number;

  /** ラウンジ最安金額 */
  public loungeMin?: number;

  /** 子コンポーネントの表示・非表示 */
  public serviceDisplayState: PlanReviewServiceDisplayState = {
    fBag: { isShowBtn: false, isShowTable: false },
    lounge: { isShowBtn: false, isShowTable: false },
    meal: { isShowBtn: false, isShowTable: false },
    pet: { isShowBtn: false, isShowTable: false },
  };

  /** 機内食種別毎の申込状況 */
  public mealApplicationState: MealApplicationState = {};

  /** 画面出力用の事前追加手荷物申込状況 */
  public outputFBagInfo: PlanReviewOutputFBagInfo = {
    bounds: [],
    passengers: [],
  };

  /** 画面出力用のラウンジ申込状況 */
  public outputLoungeInfo: PlanReviewOutputLoungeInfo = {
    segments: [],
    passengers: [],
  };

  /** 画面出力用の機内食申込状況 */
  public outputMealInfo: PlanReviewOutputMealInfo = {
    segments: [],
    passengers: [],
  };

  /** 画面出力用のペットらくのり申込状況 */
  public outputPetInfo: PlanReviewOutputPetInfo = {
    segments: [],
    passengers: [],
  };

  /** バウンド区分を排した全セグリスト */
  public segAll: Array<BoundFlightsInner> = [];

  /** バウンド区分を排した最新化前全セグリスト */
  public prevSegAll: Array<BoundFlightsInner> = [];

  /** 有料機内食名称 */
  public ancillaryMealNameList: Array<MListData> = [];

  /** 機内食期限切れの旨の文言 */
  public mealExpiredMsg = '';

  /**
   * コンストラクタ
   */
  constructor(
    private _common: CommonLibService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _systemDateService: SystemDateService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _diffEmphSvc: DiffEmphService,
    private _servicePartsService: PlanReviewServicePartsService,
    private _staticMsgPipe: StaticMsgPipe
  ) {
    super(_common);
  }

  init(): void {
    this.subscribeService(
      'PlanReviewServiceParts isMasterDataSet',
      this._isMasterDataSetSbj.asObservable().pipe(first((isSet) => !!isSet)),
      () => {
        this.deleteSubscription('PlanReviewServiceParts isMasterDataSet');
        this.refresh();
      }
    );
  }

  refresh(): void {
    this.subscribeService(
      'PlanReviewServiceParts CurrentCart$',
      this._currentCartStoreService.getCurrentCart$().pipe(first((store) => !store.isPending)),
      (data) => {
        this.deleteSubscription('PlanReviewServiceParts CurrentCart$');
        this.isPlanValid = !isEmptyObject(data.data?.plan ?? {});

        const plan = data.data?.plan;
        const prevPlan = data.data?.previousPlan;
        const displayCartPlan = this.isPlanValid ? plan : prevPlan;

        const fBagInfo = plan?.services?.baggage?.firstBaggage ?? {};
        const prevFBagInfo = prevPlan?.services?.baggage?.firstBaggage ?? {};
        const displayFBagInfo = this.isPlanValid ? fBagInfo : prevFBagInfo;
        const loungeInfo = plan?.services?.lounge ?? {};
        const prevLoungeInfo = prevPlan?.services?.lounge ?? {};
        const displayLoungeInfo = this.isPlanValid ? loungeInfo : prevLoungeInfo;
        const mealInfo = plan?.services?.meal ?? {};
        const prevMealInfo = prevPlan?.services?.meal ?? {};
        const petInfo = plan?.services?.pet;
        const prevPetInfo = prevPlan?.services?.pet;

        // segAll, prevSegAllに値を代入
        const currentBounds = plan?.airOffer?.bounds ?? [];
        this.segAll = currentBounds.reduce(
          (sum: BoundFlightsInner[], bound) => (sum = sum.concat(bound.flights ?? [])),
          []
        );
        const prevBounds = prevPlan?.airOffer?.bounds ?? [];
        this.prevSegAll = prevBounds.reduce(
          (sum: BoundFlightsInner[], bound) => (sum = sum.concat(bound.flights ?? [])),
          []
        );

        // 各サービス申込ボタン・申込状況テーブル表示要否判定
        const ancillarySummary = displayCartPlan?.chargeableAncillarySummary ?? {};
        const ancillarySummaryList = Object.values(ancillarySummary);
        // 各サービスについて、1件でも申込がなされているか
        const isAppliedAnyFBag = ancillarySummaryList.some((bound) => bound.firstBaggage?.numberOfRequests);
        const isAppliedAnyLounge = ancillarySummaryList.some((segment) => segment.lounge?.numberOfRequests);
        const isAppliedAnyMeal = this._servicePartsService.isAppliedAnyMeal(displayCartPlan?.services?.meal ?? {});

        // 申込可能か否か
        const isFBagAvailable = this._servicePartsService.isFBagAvailable(
          displayCartPlan?.services?.baggage?.firstBaggage ?? {}
        );
        const isLoungeAvailable = this._servicePartsService.isLoungeAvailable(displayCartPlan?.services?.lounge ?? {});
        const isMealAvailable = this._servicePartsService.isMealAvailable(displayCartPlan?.services?.meal ?? {});
        const isInternational = displayCartPlan?.airOffer?.tripType === 'international';

        this.serviceDisplayState = {
          fBag: {
            isShowBtn: !isAppliedAnyFBag && isFBagAvailable,
            isShowTable: isAppliedAnyFBag,
          },
          lounge: {
            isShowBtn: !isAppliedAnyLounge && isLoungeAvailable,
            isShowTable: isAppliedAnyLounge,
          },
          meal: {
            isShowBtn: !isAppliedAnyMeal && isMealAvailable && isInternational,
            isShowTable: isAppliedAnyMeal,
          },
          pet: {
            isShowBtn: false,
            isShowTable: false,
          },
        };

        // 機内食ルールリンク表示用の判定を用意
        this.setMealApplicationState(mealInfo);

        // 事前追加手荷物最安金額を計算
        this.baggageMin = this._servicePartsService.getFBagMin(displayFBagInfo);

        // ラウンジ最安金額を計算
        this.loungeMin = this._servicePartsService.getLoungeMin(displayLoungeInfo);

        // 通貨コードを取得
        // ※新規予約フローでは複数の通貨が混在することはない
        this.currencyCode = this.isPlanValid
          ? plan?.prices?.totalPrices?.total?.currencyCode
          : prevPlan?.prices?.totalPrices?.total?.currencyCode;

        // 汎用マスタから取得する情報を保持
        const listDataAll: Array<MListData> = this.masterData?.listDataAll ?? [];
        const lang = this._common.aswContextStoreService.aswContextData.lang;
        this.ancillaryMealNameList = getKeyListData(listDataAll, 'PD_950', lang);
        this.mealExpiredMsg =
          getKeyListData(listDataAll, 'PD_030', lang)?.find((data) => data.value === '5')?.display_content ?? '';

        // 事前追加手荷物申込状況表示用処理
        if (this.serviceDisplayState.fBag.isShowTable) {
          this.createOutputFBagInfo(fBagInfo, prevFBagInfo);
        }

        // ラウンジ申込状況表示用処理
        if (this.serviceDisplayState.lounge.isShowTable) {
          this.createOutputLoungeInfo(loungeInfo, prevLoungeInfo);
        }

        // 機内食申込状況表示用処理
        if (this.serviceDisplayState.meal.isShowTable) {
          this.createOutputMealInfo(mealInfo, prevMealInfo);
        }

        // ペットらくのり申込状況表示用処理
        if (this.serviceDisplayState.pet.isShowTable) {
          this.createOutputPetInfo(petInfo, prevPetInfo);
        }

        // 当コンポーネントの表示フラグをtrueにする
        // ※子コンポーネントがすべて非表示の場合、falseにする
        this.isShow = false;
        this.readyToShow.emit();
      }
    );
  }

  /**
   * 画面表示用事前追加手荷物リスト作成処理
   * @param currentFBagInfo
   * @param prevFBagInfo
   */
  createOutputFBagInfo(currentFBagInfo?: RamlServicesBaggageFirst, prevFBagInfo?: RamlServicesBaggageFirst): void {
    const outputFBagInfo: PlanReviewOutputFBagInfo = {
      bounds: [],
      passengers: [],
    };

    // 事前追加手荷物利用対象バウンドIDのリストを作成
    const fBagInfoBasis = this.isPlanValid ? currentFBagInfo ?? {} : prevFBagInfo ?? {};
    const fBagAvailableBoundIdList = Object.entries(fBagInfoBasis)
      .filter(([boundId, boundValue]) => {
        // 申込済みまたは申込可能な搭乗者が1人でも存在するバウンドのみに絞る
        const paxInfoList = Object.values(boundValue).filter(
          this._servicePartsService.isNotBool<RamlServicesBaggageFirstSegmentMain>
        );
        return paxInfoList.some((pax) => pax.isAvailable || !isStringEmpty(pax.id));
      })
      .map(([boundId, boundValue]) => boundId);

    // outputFBagInfo.boundsに発着地情報を格納
    fBagAvailableBoundIdList.forEach((boundId) => {
      const bounds = this.isPlanValid
        ? this._currentCartStoreService.CurrentCartData.data?.plan?.airOffer?.bounds ?? []
        : this._currentCartStoreService.CurrentCartData.data?.previousPlan?.airOffer?.bounds ?? [];
      const targetBound = bounds.find((bound) => bound.airBoundId === boundId);
      if (targetBound) {
        const airportCache = this.masterData?.airport ?? {};
        outputFBagInfo.bounds?.push({
          departure:
            getAirportNameFromCache(targetBound.originLocationCode ?? '', airportCache) ??
            targetBound.originLocationName,
          arrival:
            getAirportNameFromCache(targetBound.destinationLocationCode ?? '', airportCache) ??
            targetBound.destinationLocationName,
        });
      } else {
        outputFBagInfo.bounds?.push({});
      }
    });

    // outputFBagInfo.passengersに搭乗者情報を格納
    const travelers = this.isPlanValid
      ? this._currentCartStoreService.CurrentCartData.data?.plan?.travelers ?? []
      : this._currentCartStoreService.CurrentCartData.data?.previousPlan?.travelers ?? [];
    travelers.forEach((traveler, index) => {
      if (traveler.passengerTypeCode !== PassengerType.INF) {
        // 幼児を除外
        // 変更管理 No.50 第3性別対応
        const name = getPaxName(traveler) ?? this._staticMsgPipe.transform('label.passenger.n', { '0': index + 1 });
        let passenger = {
          id: traveler.id,
          index: index,
          name: name,
          boundInfo: [],
        };
        if (traveler.accompanyingTravelerId) {
          const accompanyingTraveler = travelers.find((item) => item.id === traveler.accompanyingTravelerId);
          const accompanyingTravelerIndex = travelers.findIndex((item) => item.id === traveler.accompanyingTravelerId);
          if (accompanyingTraveler) {
            passenger = {
              ...passenger,
              ...{
                accompanyingName:
                  getPaxName(accompanyingTraveler) ??
                  this._staticMsgPipe.transform('label.passenger.n', {
                    '0': accompanyingTravelerIndex + 1,
                  }),
              },
            };
          }
        }
        outputFBagInfo.passengers?.push(passenger);
      }
    });

    // outputFBagInfo.passengers.boundInfoにバウンド毎・搭乗者毎の申込状況を格納
    fBagAvailableBoundIdList.forEach((boundId) => {
      outputFBagInfo.passengers?.forEach((traveler) => {
        const travelerId = traveler.id ?? '';
        const currentInfo = currentFBagInfo?.[boundId]?.[travelerId] as RamlServicesBaggageFirstSegmentMain | undefined;
        const currentStatus = currentInfo?.id ? 'label.applied' : undefined;
        const currentPrice = currentInfo?.prices?.total ?? 0;
        const prevInfo = prevFBagInfo?.[boundId]?.[travelerId] as RamlServicesBaggageFirstSegmentMain | undefined;
        const prevStatus = prevInfo?.id ? 'label.applied' : undefined;
        const prevPrice = prevInfo?.prices?.total ?? 0;

        const target = outputFBagInfo.passengers?.find((traveler) => traveler.id === travelerId)?.boundInfo;

        if (currentInfo || prevInfo) {
          // 新旧いずれかの当該バウンド・当該搭乗者情報が存在する場合
          const outputStatus = this._diffEmphSvc.getEmphData(currentStatus, prevStatus);
          const outputPrice = this._diffEmphSvc.getEmphData(currentPrice, prevPrice);
          const currencyCode = currentInfo?.prices?.currencyCode ?? prevInfo?.prices?.currencyCode;
          target?.push({
            status: outputStatus,
            price: outputPrice,
            currencyCode: currencyCode,
          });
        } else {
          // 当該バウンド・当該搭乗者情報が新旧ともに存在しない場合
          target?.push({
            status: { value: '', type: 'nl' },
            price: { value: 0, type: 'nl' },
            currencyCode: '',
          });
        }
      });
    });

    this.outputFBagInfo = outputFBagInfo;
    this._changeDetectorRef.detectChanges();
  }

  /**
   * 画面出力用ラウンジ情報リスト作成処理
   * @param currentLoungeInfo
   * @param prevLoungeInfo
   */
  createOutputLoungeInfo(currentLoungeInfo: RamlServicesLounge, prevLoungeInfo?: RamlServicesLounge): void {
    const outputLoungeInfo: PlanReviewOutputLoungeInfo = {
      segments: [],
      passengers: [],
    };

    // ラウンジ利用対象セグIDのリストを作成
    const loungeInfoBasis = this.isPlanValid ? currentLoungeInfo ?? {} : prevLoungeInfo ?? {};
    const loungeAvailableSegIdList = Object.entries(loungeInfoBasis)
      .filter(([segId, segValue]) => {
        // 申込済み・申込可能・無料利用可能な搭乗者が1人でも存在するセグのみに絞る
        const paxInfoList = Object.values(segValue).filter(
          this._servicePartsService.isNotBool<RamlServicesLoungeIdInfoMain>
        );
        return paxInfoList.some((pax) => pax.isAvailable || pax.isWaived || !isStringEmpty(pax.code));
      })
      .map(([segId, segValue]) => segId);

    // outputLoungeInfo.segmentに発着地情報を格納
    loungeAvailableSegIdList.forEach((segId) => {
      const targetSeg = (this.isPlanValid ? this.segAll : this.prevSegAll).find((segAllSeg) => segAllSeg.id === segId);
      if (targetSeg) {
        const airportCache = this.masterData?.airport ?? {};
        outputLoungeInfo.segments?.push({
          departure:
            getAirportNameFromCache(targetSeg.departure?.locationCode ?? '', airportCache) ??
            targetSeg.departure?.locationName,
          arrival:
            getAirportNameFromCache(targetSeg.arrival?.locationCode ?? '', airportCache) ??
            targetSeg.arrival?.locationName,
        });
      } else {
        outputLoungeInfo.segments?.push({});
      }
    });

    // outputLoungeInfo.passengersに搭乗者情報を格納
    const travelers = this.isPlanValid
      ? this._currentCartStoreService.CurrentCartData.data?.plan?.travelers ?? []
      : this._currentCartStoreService.CurrentCartData.data?.previousPlan?.travelers ?? [];
    travelers.forEach((traveler, index) => {
      if (traveler.passengerTypeCode !== PassengerType.INF) {
        // 幼児を除外
        // 変更管理 No.50 第3性別対応
        const name = getPaxName(traveler) ?? this._staticMsgPipe.transform('label.passenger.n', { '0': index + 1 });
        let passenger = {
          id: traveler.id,
          index: index,
          name: name,
          segInfo: [],
        };
        if (traveler.accompanyingTravelerId) {
          const accompanyingTraveler = travelers.find((item) => item.id === traveler.accompanyingTravelerId);
          const accompanyingTravelerIndex = travelers.findIndex((item) => item.id === traveler.accompanyingTravelerId);
          if (accompanyingTraveler) {
            passenger = {
              ...passenger,
              ...{
                accompanyingName:
                  getPaxName(accompanyingTraveler) ??
                  this._staticMsgPipe.transform('label.passenger.n', {
                    '0': accompanyingTravelerIndex + 1,
                  }),
              },
            };
          }
        }
        outputLoungeInfo.passengers?.push(passenger);
      }
    });

    // outputLoungeInfo.passengers.segInfoにセグ毎・搭乗者毎の申込状況を格納
    loungeAvailableSegIdList.forEach((segId) => {
      outputLoungeInfo.passengers?.forEach((traveler) => {
        const travelerId = traveler.id ?? '';
        const currentInfo = currentLoungeInfo?.[segId]?.[travelerId] as RamlServicesLoungeIdInfoMain | undefined;
        const currentStatus = currentInfo?.isWaived ? 'label.useFree' : undefined;
        const currentLoungeName = this._servicePartsService.getLoungeName(currentInfo?.code ?? '');
        const currentPrice = currentInfo?.prices?.total ?? 0;
        const prevInfo = prevLoungeInfo?.[segId]?.[travelerId] as RamlServicesLoungeIdInfoMain | undefined;
        const prevStatus = prevInfo?.isWaived ? 'label.useFree' : undefined;
        const prevLoungeName = this._servicePartsService.getLoungeName(prevInfo?.code ?? '');
        const prevPrice = prevInfo?.prices?.total ?? 0;

        const target = outputLoungeInfo.passengers?.find((traveler) => traveler.id === travelerId)?.segInfo;

        if (currentInfo || prevInfo) {
          // 新旧いずれかの当該セグ・当該搭乗者情報が存在する場合
          const isApplied = !!(this.isPlanValid ? currentInfo?.code : prevInfo?.code);
          const isWaived = this.isPlanValid ? currentInfo?.isWaived : prevInfo?.isWaived;
          const outputStatus = this._diffEmphSvc.getEmphData(currentStatus, prevStatus);
          const outputLoungename = this._diffEmphSvc.getEmphData(currentLoungeName, prevLoungeName);
          const outputPrice = this._diffEmphSvc.getEmphData(currentPrice, prevPrice);
          const currencyCode = currentInfo?.prices?.currencyCode ?? prevInfo?.prices?.currencyCode;
          target?.push({
            isApplied: isApplied,
            isWaived: isWaived,
            status: outputStatus,
            name: outputLoungename,
            price: outputPrice,
            currencyCode: currencyCode,
          });
        } else {
          // 当該セグ・当該搭乗者情報が新旧ともに存在しない場合
          target?.push({
            isApplied: false,
            isWaived: false,
            status: { value: '', type: 'nl' },
            name: { value: '', type: 'nl' },
            price: { value: 0, type: 'nl' },
            currencyCode: undefined,
          });
        }
      });
    });

    this.outputLoungeInfo = outputLoungeInfo;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * 画面出力用機内食情報リスト作成処理
   * @param currentMealInfo
   * @param prevMealInfo
   */
  createOutputMealInfo(currentMealInfo: RamlServicesMeal, prevMealInfo: RamlServicesMeal): void {
    const outputMealInfo: PlanReviewOutputMealInfo = {
      segments: [],
      passengers: [],
    };

    // 機内食利用対象セグIDのリストを作成
    const mealInfoBasis = this.isPlanValid ? currentMealInfo ?? {} : prevMealInfo ?? {};
    const mealAvailableSegIdList = Object.keys(mealInfoBasis).filter((segId) => {
      // NHグループ販売＆運航の国際便のみに絞る
      const segInfo = (this.isPlanValid ? this.segAll : this.prevSegAll).find((segAllSeg) => segAllSeg.id === segId);
      return segInfo?.isNhGroupMarketing && segInfo?.isNhGroupOperated && !segInfo?.isJapanDomesticFlight;
    });

    // outputMealInfo.segmentに発着地情報を格納
    mealAvailableSegIdList.forEach((segId) => {
      const targetSeg = (this.isPlanValid ? this.segAll : this.prevSegAll).find((segment) => segment.id === segId);
      if (targetSeg) {
        const airportCache = this.masterData?.airport ?? {};
        outputMealInfo.segments?.push({
          departure:
            getAirportNameFromCache(targetSeg.departure?.locationCode ?? '', airportCache) ??
            targetSeg.departure?.locationName,
          arrival:
            getAirportNameFromCache(targetSeg.arrival?.locationCode ?? '', airportCache) ??
            targetSeg.arrival?.locationName,
        });
      } else {
        outputMealInfo.segments?.push({});
      }
    });

    // outputMealInfo.passengersに搭乗者情報を格納
    const travelers = this.isPlanValid
      ? this._currentCartStoreService.CurrentCartData.data?.plan?.travelers ?? []
      : this._currentCartStoreService.CurrentCartData.data?.previousPlan?.travelers ?? [];
    travelers.forEach((traveler, index) => {
      // ※機内食に関しては幼児も除外しない
      // 変更管理 No.50 第3性別対応
      const name = getPaxName(traveler) ?? this._staticMsgPipe.transform('label.passenger.n', { '0': index + 1 });
      outputMealInfo.passengers?.push({
        id: traveler.id,
        index: index,
        name: name,
        segInfo: [],
      });
    });

    // outputMealInfo.passengers.segInfoにセグ毎・搭乗者毎の申込状況を格納
    mealAvailableSegIdList.forEach((segId) => {
      outputMealInfo.passengers?.forEach((traveler) => {
        const travelerId = traveler.id ?? '';

        const currentInfo = (currentMealInfo?.[segId]?.[travelerId] as RamlServicesMealPassenger | undefined)
          ?.appliedMealList?.[0];
        const currentPrice = currentInfo?.price?.total ?? 0;
        const currentSegFlightInfo = this.segAll.find((segment) => segment.id === segId);
        const currentMsgParams = {
          isExpired: currentMealInfo[segId]?.isExpired ?? false,
          segTravelerInfo: currentInfo,
          airlineCode: currentSegFlightInfo?.marketingAirlineCode ?? '',
          flightNumber: currentSegFlightInfo?.marketingFlightNumber ?? '',
        };
        const currentMsg = this.getMealMsg(currentMsgParams);

        const prevInfo = (prevMealInfo?.[segId]?.[travelerId] as RamlServicesMealPassenger | undefined)
          ?.appliedMealList?.[0];
        const prevPrice = prevInfo?.price?.total ?? 0;
        const prevSegFlightInfo = this.prevSegAll.find((segment) => segment.id === segId);
        const prevMsgParams = {
          isExpired: prevMealInfo[segId]?.isExpired ?? false,
          segTravelerInfo: prevInfo,
          airlineCode: prevSegFlightInfo?.marketingAirlineCode ?? '',
          flightNumber: prevSegFlightInfo?.marketingFlightNumber ?? '',
        };
        const prevMsg = this.getMealMsg(prevMsgParams);

        const target = outputMealInfo.passengers?.find((traveler) => traveler.id === travelerId)?.segInfo;

        // 出力用のデータを作成しpush
        const outputMsg = this._diffEmphSvc.getEmphData(currentMsg, prevMsg) ?? '';
        const outputPrice = this._diffEmphSvc.getEmphData(currentPrice, prevPrice) ?? 0;
        const currencyCode = currentInfo?.price?.currencyCode ?? prevInfo?.price?.currencyCode;
        target?.push({
          msg: outputMsg,
          price: outputPrice,
          currencyCode: currencyCode,
        });
      });
    });

    this.outputMealInfo = outputMealInfo;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * FY25: 画面出力用ペットらくのり情報リスト作成処理
   * @param currentPetInfo
   * @param prevPetInfo
   */
  createOutputPetInfo(
    currentPetInfo?: CreateCartResponseDataPlanServicesPet,
    prevPetInfo?: CreateCartResponseDataPlanServicesPet
  ): void {
    const outputPetInfo: PlanReviewOutputPetInfo = {
      segments: [],
      passengers: [],
    };

    // ペットらくのりは全セグ表示
    outputPetInfo.segments = (this.isPlanValid ? this.segAll : this.prevSegAll).map((segAllSeg) => ({
      departure:
        getAirportNameFromCache(segAllSeg.departure?.locationCode ?? '', this.masterData?.airport ?? {}) ??
        segAllSeg.departure?.locationName,
      arrival:
        getAirportNameFromCache(segAllSeg.arrival?.locationCode ?? '', this.masterData?.airport ?? {}) ??
        segAllSeg.arrival?.locationName,
    }));

    // outputPetInfo.passengersに搭乗者情報を格納
    const travelers = this.isPlanValid
      ? this._currentCartStoreService.CurrentCartData.data?.plan?.travelers ?? []
      : this._currentCartStoreService.CurrentCartData.data?.previousPlan?.travelers ?? [];
    travelers.forEach((traveler, index) => {
      if (traveler.passengerTypeCode !== PassengerType.INF) {
        // 幼児を除外

        // 申込状況差分強調表示用の情報を用意
        const isApplied = Object.values(currentPetInfo?.registeredPets ?? {}).some((segment) =>
          segment[traveler.id ?? '']?.some((pet) => pet?.id)
        );
        const currentStatus = isApplied ? 'label.applied' : undefined;
        const wasApplied = Object.values(prevPetInfo?.registeredPets ?? {}).some((segment) =>
          segment[traveler.id ?? '']?.some((pet) => pet?.id)
        );
        const prevStatus = wasApplied ? 'label.applied' : undefined;
        const outputStatus = this._diffEmphSvc.getEmphData(currentStatus, prevStatus);

        // ペットらくのりの場合、全セグ列に同一の情報を表示する
        const segInfoList: Array<PlanReviewOutputPetInfoPassengerSegInfo> = new Array(
          outputPetInfo.segments?.length
        ).fill({
          status: outputStatus,
        });

        // 変更管理 No.50 第3性別対応
        const name = getPaxName(traveler) ?? this._staticMsgPipe.transform('label.passenger.n', { '0': index + 1 });
        outputPetInfo.passengers?.push({
          id: traveler.id,
          index: index,
          name: name,
          segInfo: segInfoList,
        });
      }
    });

    this.outputPetInfo = outputPetInfo;
    this._changeDetectorRef.markForCheck();
  }

  /**
   * 機内食文言取得処理
   * @param params
   * @returns
   */
  getMealMsg(params: {
    isExpired: boolean;
    segTravelerInfo?: RamlServicesMealPassengerAppliedMeal;
    airlineCode?: string;
    flightNumber?: string;
  }): string {
    let msg = '';

    const ssrCode = params.segTravelerInfo?.code ?? '';

    if (isStringEmpty(ssrCode) && !params.isExpired) {
      // 未申込かつ申込期限切れの場合
      msg = this.mealExpiredMsg;
    } else if (!isStringEmpty(ssrCode)) {
      // 申込済みの場合
      switch (params.segTravelerInfo?.type) {
        case 'preOrder':
          // 事前ミールの場合
          msg = this._staticMsgPipe.transform(params.segTravelerInfo.preOrderMealMessageId ?? '');
          break;
        case 'ancillary':
          // 有料機内食の場合
          msg =
            this.ancillaryMealNameList.find((nameData) => nameData.value === params.segTravelerInfo?.code)
              ?.display_content ?? '';
          break;
        case 'special':
          // 特別機内食の場合
          const currentDate = this._systemDateService.getSystemDate();
          msg =
            this.masterData?.specialMeal?.find((mealData) => {
              const from = string8ToDate(mealData.apply_from_date);
              const to = string8ToDate(mealData.apply_to_date);
              // NaN判定
              const isComparable = [from, to].every((date) => !Number.isNaN(date.getTime()));
              const isValid = isComparable && from <= currentDate && currentDate <= to;
              return isValid && mealData.ssr_code === params.segTravelerInfo?.code;
            })?.special_meal_name ?? '';
          break;
        default:
          break;
      }
      // msgが取得できなかった場合
      msg ||= this._staticMsgPipe.transform('label.unknownMenu');
    } else {
      // 未申込の場合
      if (this.isPreorderMealFlight(params.airlineCode ?? '', params.flightNumber ?? '')) {
        // 事前ミールオーダー対象の場合
        msg = this._staticMsgPipe.transform('label.mealGuidanceBeforeApplication');
      } else {
        // 事前ミールオーダー対象外の場合
        msg = this._staticMsgPipe.transform('label.normalMeal');
      }
    }

    return msg;
  }

  /**
   * 事前オーダーミール対象便判定処理
   * @param airlineCode
   * @param flightNumber
   * @returns Promise<boolean>
   */
  isPreorderMealFlight(airlineCode: string, flightNumber: string): boolean {
    return !!this.masterData?.preorderMeal?.find(
      (flight) => flight.airline_code === airlineCode && flight.flight_number === flightNumber
    );
  }

  /**
   * 機内食ルールリンク用判定の作成処理
   * @param mealInfo
   */
  setMealApplicationState(mealInfo: RamlServicesMeal): void {
    // 通常機内食
    const currentCart = this.isPlanValid
      ? this._currentCartStoreService.CurrentCartData.data?.plan
      : this._currentCartStoreService.CurrentCartData.data?.previousPlan;
    const numberOfTraveler = currentCart?.travelersSummary?.numberOfTraveler;
    const paxNum =
      (numberOfTraveler?.ADT ?? 0) +
      (numberOfTraveler?.B15 ?? 0) +
      (numberOfTraveler?.CHD ?? 0) +
      (numberOfTraveler?.INF ?? 0);
    const normalMealSegIdList = Object.entries(mealInfo)
      .filter(
        ([segId, segValue]) =>
          // 申込可能かつ未申込セグ・搭乗者が存在する
          segValue?.isAvailable && // 申込可能
          segValue?.isExpired && // 受付期限切れでない
          Object.values(segValue).reduce(
            (sum, traveler) =>
              sum +
              (this._servicePartsService.isNotBool<RamlServicesMealPassenger>(traveler) &&
              traveler.appliedMealList?.[0]?.code
                ? 1
                : 0),
            0
          ) < paxNum // 当該区間未申込の搭乗者が存在する
      )
      .map(([segId, segValue]) => segId);
    normalMealSegIdList.forEach((segId) => {
      const cabin = this.segAll.find((segment) => segment.id === segId)?.cabin;
      switch (cabin) {
        case 'first':
          this.mealApplicationState.isNormalF = true;
          break;
        case 'business':
          this.mealApplicationState.isNormalB = true;
          break;
        case 'ecoPremium':
          this.mealApplicationState.isNormalP = true;
          break;
        case 'eco':
          this.mealApplicationState.isNormalE = true;
          break;
        default:
          break;
      }
    });
    // 事前ミール
    this.mealApplicationState.isPreorderF = Object.entries(mealInfo).some(
      ([segId, segValue]) =>
        Object.values(segValue ?? {}).some(
          (traveler) =>
            this._servicePartsService.isNotBool<RamlServicesMealPassenger>(traveler) &&
            traveler.appliedMealList?.[0]?.type === 'preOrder'
        ) && this.segAll.find((segAllSeg) => segAllSeg.id === segId)?.cabin === 'first'
    );
    this.mealApplicationState.isPreorderB = Object.entries(mealInfo).some(
      ([segId, segValue]) =>
        Object.values(segValue ?? {}).some(
          (traveler) =>
            this._servicePartsService.isNotBool<RamlServicesMealPassenger>(traveler) &&
            traveler.appliedMealList?.[0]?.type === 'preOrder'
        ) && this.segAll.find((segAllSeg) => segAllSeg.id === segId)?.cabin === 'business'
    );
    // 有料機内食
    this.mealApplicationState.isAncillary = Object.values(mealInfo).some((segment) =>
      Object.values(segment ?? {}).some(
        (traveler) =>
          this._servicePartsService.isNotBool<RamlServicesMealPassenger>(traveler) &&
          traveler.appliedMealList?.[0]?.type === 'ancillary'
      )
    );
    // 特別機内食
    this.mealApplicationState.isSpecial = Object.values(mealInfo).some((segment) =>
      Object.values(segment ?? {}).some(
        (traveler) =>
          this._servicePartsService.isNotBool<RamlServicesMealPassenger>(traveler) &&
          traveler.appliedMealList?.[0]?.type === 'special'
      )
    );
  }

  reload(): void {}

  destroy(): void {}
}
