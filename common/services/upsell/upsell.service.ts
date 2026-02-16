import { DatePipe } from '@angular/common';
import { Injectable, NgZone } from '@angular/core';
import {
  apiEventAll,
  deleteHtmlTags,
  fixedArrayCache,
  formatSeconds,
  getOwdRequestItinerariesFromCart,
} from '@common/helper';
import { CancelAirOffer, UpsellAirOffer, AswPageOutputUpsell, MLangCodeConvert } from '@common/interfaces';
import {
  CancelPrebookService,
  CurrentCartStoreService,
  DeliveryInformationStoreService,
  PlanReviewStoreService,
  RoundtripOwdService,
  UpdateAirOffersStoreService,
} from '@common/services';
import { SupportClass } from '@lib/components/support-class';
import { AmountFormatPipe, DateFormatPipe } from '@lib/pipes';
import {
  AlertMessageStoreService,
  AswMasterService,
  CommonLibService,
  ErrorsHandlerService,
  PageLoadingService,
} from '@lib/services';
import { Observable, of } from 'rxjs';
import {
  RoundtripOwdRequest,
  Bound,
  Type9 as BoundFlightsInner,
  RoundtripOwdResponseDataRoundtripBoundsInnerTravelSolutionsSummary,
  RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInner,
  RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInnerTravelSolutionIdInner,
  RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInnerTravelSolutionIdInnerFareFamilyCodeInner,
  RoundtripOwdResponseDataAirOffers,
  RoundtripOwdResponseDataAirOffersInner,
  RoundtripOwdResponseDataAirOffersInnerBoundsInnerFlightsInner,
  RoundtripOwdResponseDataAirOffersInnerBoundsInner,
} from 'src/sdk-search';
import { AlertMessageItem, AlertType, ErrorType } from '@lib/interfaces';
import { getUpsellServiceMasterKey } from './upsell.state';
import { RoundtripOwdState } from '@common/store/roundtrip-owd';
import { CurrentCartState, UpsellFunctionType } from '@common/store';
import { PlanReviewContService } from '@app/plan-review/container/plan-review-cont.service';

/**
 * アップセル関連処理サービス
 */
@Injectable({
  providedIn: 'root',
})
export class UpsellService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _roundtripOwdService: RoundtripOwdService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _planReviewStoreService: PlanReviewStoreService,
    private _datePipe: DatePipe,
    private _dateFormatPipe: DateFormatPipe,
    private _amountFormatPipe: AmountFormatPipe,
    private _aswMasterSvc: AswMasterService,
    private _updateAirOffersStoreService: UpdateAirOffersStoreService,
    private _cancelPrebookStoreService: CancelPrebookService,
    private _deliveryInfoStoreSvc: DeliveryInformationStoreService,
    private _alertMsgStoreService: AlertMessageStoreService,
    private _contService: PlanReviewContService,
    private _pageLoadingService: PageLoadingService,
    private _ngZone: NgZone
  ) {
    super();
  }

  /** マスタデータ */
  public masterData: {
    airportCache: { [key: string]: string };
    ffCache: { [key: string]: string };
    langCodeConvertCache: Array<MLangCodeConvert>;
  } = {
    airportCache: {},
    ffCache: {},
    langCodeConvertCache: [],
  };

  /**
   * アップセルオファー情報・キャンセル情報取得処理
   * @returns 画面情報JSON出力用のアップセル情報のObservable
   */
  getUpsellInfo(): Observable<AswPageOutputUpsell> {
    return new Observable((observer) => {
      // 空席照会結果＆キャッシュを取得
      const lang = this._common.aswContextStoreService.aswContextData.lang;
      const currentCart = this._currentCartStoreService.CurrentCartData;
      this.forkJoinService(
        'UpsellService RoundtripOwd$ + getMasterDataAll',
        [this._getOwdResult$(currentCart), this._aswMasterSvc.load(getUpsellServiceMasterKey(lang), true)],
        (data) => {
          this.deleteSubscription('UpsellService RoundtripOwd$ + getMasterDataAll');

          const airOffers = data[0]?.data?.airOffers ?? {};
          const filteredAirOffers = {
            outbound: this._getFilteredAirOffersWithIdByBound(airOffers, 0),
            inbound: this._getFilteredAirOffersWithIdByBound(airOffers, 1),
          };

          this.masterData.airportCache = data[1]?.[0];
          this.masterData.ffCache = data[1]?.[1];
          this.masterData.langCodeConvertCache = fixedArrayCache(data[1]?.[2]);

          const boundNum = currentCart.data?.plan?.airOffer?.bounds?.length ?? 0;

          // アップセルオファー情報
          const outbound = this._getUpsellOffersByBound(filteredAirOffers.outbound, 0);
          const sortedOutbound = this._sortUpsellOffersByBound(outbound, 0);
          const inbound = boundNum === 2 ? this._getUpsellOffersByBound(filteredAirOffers.inbound, 1) : undefined;
          const sortedInbound = boundNum === 2 ? this._sortUpsellOffersByBound(inbound ?? [], 1) : undefined;

          // アップセルキャンセル用情報
          const { outboundCancelAirOffer, inboundCancelAirOffer } = this._getCancelAirOffers();
          const response: AswPageOutputUpsell = {
            outboundAirOffers: { upsellAirOffers: sortedOutbound },
            inboundAirOffers: { upsellAirOffers: sortedInbound },
            outboundCancelAirOffer: outboundCancelAirOffer,
            inboundCancelAirOffer: inboundCancelAirOffer,
          };

          observer.next(response);
        },
        (error) => {
          observer.error(error);
        }
      );
    });
  }

  /**
   * 往復指定日空席照会(OWD)レスポンス取得処理
   * ※storeに前回の実行結果が存在する場合、storeから取得する
   * @param currentCartData 操作中カート情報
   * @returns 往復指定日空席照会(OWD)レスポンス
   */
  private _getOwdResult$(currentCartData: CurrentCartState): Observable<RoundtripOwdState> {
    // APIレスポンスが残っている場合、それを用いる
    const previousResult = this._roundtripOwdService.roundtripOwdData;
    if (Object.values(previousResult?.data?.airOffers ?? {}).length) {
      return of(previousResult);
    }
    // APIレスポンスが残っていない場合、APIを呼ぶ
    return new Observable((observer) => {
      const itineraries = getOwdRequestItinerariesFromCart(
        currentCartData.data?.searchCriteria?.searchAirOffer?.itineraries ?? []
      );
      const request: RoundtripOwdRequest = {
        itineraries: itineraries,
        travelers: {
          ADT: currentCartData.data?.plan?.travelersSummary?.numberOfTraveler?.ADT ?? 0,
          B15: currentCartData.data?.plan?.travelersSummary?.numberOfTraveler?.B15 ?? 0,
          CHD: currentCartData.data?.plan?.travelersSummary?.numberOfTraveler?.CHD ?? 0,
          INF: currentCartData.data?.plan?.travelersSummary?.numberOfTraveler?.INF ?? 0,
        },
        fare: currentCartData.data?.searchCriteria?.searchAirOffer?.fare ?? { isMixedCabin: false },
        promotion: currentCartData.data?.searchCriteria?.searchAirOffer?.promotion,
      };
      apiEventAll(
        () => this._roundtripOwdService.setRoundtripOwdFromApi(request),
        this._roundtripOwdService.getRoundtripOwdObservable(),
        (success) => {
          observer.next(success);
          observer.complete();
        },
        (error) => {
          observer.error();
          observer.complete();
        }
      );
    });
  }

  /**
   * airOffers絞り込み処理
   * @param airOffers airOffer情報の配列
   * @returns フィルター後のairOffer情報の配列
   */
  private _getFilteredAirOffersWithIdByBound(
    airOffers: RoundtripOwdResponseDataAirOffers,
    boundIndex: number
  ): [string, RoundtripOwdResponseDataAirOffersInner][] {
    const currentCartPlan = this._currentCartStoreService.CurrentCartData.data?.plan;
    const cartBounds = currentCartPlan?.airOffer?.bounds ?? [];
    const searchAirOffer = this._currentCartStoreService.CurrentCartData.data?.searchCriteria?.searchAirOffer;
    const roundtripBounds = this._roundtripOwdService.roundtripOwdData.data?.roundtripBounds ?? [];

    // 以下、往復空席照会結果のairOffersから、アップセル対象となるものを絞り込む

    const filteredAirOffersWithIds = Object.entries(airOffers ?? {})
      // 除外条件1：復路のフライト・FFが現在の旅程と異なる
      // （※往路を対象とする場合のコメント。復路対象の場合、往路を復路、復路を往路に読み替える。以下同様）
      .filter(([airOfferId, airOffer]) => {
        if (cartBounds.length === 1) {
          // 片道旅程の場合
          return true;
        } else {
          // 往復旅程の場合
          const oppIndex = Number(!boundIndex);
          // 当該airOffer：他方のバウンドの便番号
          const airOfferOppFlightNumbers = roundtripBounds[oppIndex]?.travelSolutions
            ?.find((ts) => ts.travelSolutionId === airOffer?.bounds?.[oppIndex]?.travelSolutionId)
            ?.flights?.map((segment) => `${segment.marketingAirlineCode}${segment.marketingFlightNumber}`);
          // 当該airOffer：他方のバウンドのFFコード
          const airOfferOppFFCode = airOffer?.bounds?.[oppIndex]?.fareFamilyCode;

          // 操作中カート：他方のバウンドの便番号
          const cartOppFlightNumbers = cartBounds[oppIndex]?.flights?.map(
            (segment) => `${segment.marketingAirlineCode}${segment.marketingFlightNumber}`
          );
          const cartOppFFCode = currentCartPlan?.airOffer?.bounds?.[oppIndex]?.flights?.[0]?.fareInfos?.fareFamilyCode;

          return (
            airOfferOppFlightNumbers?.every((flightNum, index) => flightNum === cartOppFlightNumbers?.[index]) &&
            airOfferOppFFCode === cartOppFFCode
          );
        }
      })
      // 除外条件2：現在の全旅程の支払総額と当該空席照会結果の旅程全体の支払総額の差額が設定ファイルにて定める差額割合を超える
      .filter(([airOfferId, airOffer]) => {
        // 支払総額の差額割合を算出
        const currentTotal = currentCartPlan?.prices?.totalPrices?.total?.value ?? 0;
        const airOfferTotal = airOffer?.prices?.totalPrice?.total;
        // ※国際旅程か国内単独旅程かにより、判定に用いるプロパティ値が異なる
        const isInt = currentCartPlan?.airOffer?.tripType === 'international';
        const borderRatio = parseFloat(
          this._aswMasterSvc.getMPropertyByKey('plan', isInt ? 'upsell.diffRatio' : 'upsell.diffRatio.domestic')
        );
        return airOfferTotal && airOfferTotal <= currentTotal * (1 + borderRatio / 100);
      })
      // 除外条件3：往路のセグメント数が増えている
      .filter(
        ([airOfferId, airOffer]) =>
          (airOffer?.bounds?.[boundIndex]?.flights?.length ?? 0) <= (cartBounds[boundIndex]?.flights?.length ?? 0)
      )
      // 除外条件4：往路について、バウンドのFFのキャビンクラスが、検索条件のCFFのキャビンクラスと一致する
      .filter(
        ([airOfferId, airOffer]) =>
          roundtripBounds[boundIndex]?.fareFamilies?.find(
            (ff) => ff.fareFamilyCode === airOffer?.bounds?.[boundIndex]?.fareFamilyCode
          )?.fareFamilyWithService?.cabin !== searchAirOffer?.fare?.cabinClass
      )
      // 除外条件5：往路について、日本発着国際線のキャビンクラスに変更が1便もない
      // 除外条件6：往路について、日本発着国際線のキャビンクラスに変更がないセグメントを含み、
      // かつ当該セグメントがNHグループ運航から他社運航に変わっている
      .filter(([airOfferId, airOffer]) => {
        const tsIdList = airOffer?.bounds?.map((bound) => bound.travelSolutionId);
        const travelSolutionList = roundtripBounds.map((bound, index) =>
          bound.travelSolutions?.find((ts) => ts.travelSolutionId === tsIdList?.[index])
        );

        // 当該airOfferの日本発着国際線セグリスト
        const airOfferJpSegList: RoundtripOwdResponseDataAirOffersInnerBoundsInnerFlightsInner[][] = [];
        // travelSolutionsの日本発着国際線セグリスト
        const travelSolutionJpSegList: BoundFlightsInner[][] = [];

        // 上記2つの配列に要素を詰めていく
        travelSolutionList.forEach((ts, bdIndex) => {
          const airOfferJpSegListChd: Array<RoundtripOwdResponseDataAirOffersInnerBoundsInnerFlightsInner> = [];
          const travelSolutionJpSegListChd: Array<BoundFlightsInner> = [];
          ts?.flights?.forEach((segment, segIndex) => {
            if (!segment.isJapanDomesticFlight) {
              airOfferJpSegListChd.push(airOffer?.bounds?.[bdIndex]?.flights?.[segIndex] ?? {});
              travelSolutionJpSegListChd.push(segment);
            }
          });
          airOfferJpSegList.push(airOfferJpSegListChd);
          travelSolutionJpSegList.push(travelSolutionJpSegListChd);
        });

        // カートのバウンド毎の日本発着国際線セグリスト
        const cartJpSegListByBound = cartBounds.map((bound) => this.getJpIntSegList(bound as Bound));

        // いずれかのセグのCCに変更があるか否か
        const isCabinGrade = cartJpSegListByBound[boundIndex]?.some(
          (segment, segIndex) =>
            this.getCabinGrade(segment.cabin) < this.getCabinGrade(airOfferJpSegList[boundIndex]?.[segIndex]?.cabin)
        );
        // CCに変更がなく、かつNH運航→他社運航になっているセグが存在するか否か
        const isSnatched = cartJpSegListByBound[boundIndex]?.some(
          (segment, segIndex) =>
            segment.cabin === airOfferJpSegList[boundIndex]?.[segIndex]?.cabin &&
            segment.isNhGroupOperated &&
            !travelSolutionJpSegList[boundIndex]?.[segIndex]?.isNhGroupOperated
        );

        return isCabinGrade && !isSnatched;
      })
      // 除外条件7：往路についてアップセル前の旅程に存在しない空港間移動が発生する
      .filter(([airOfferId, airOffer]) => {
        const travelSolution = roundtripBounds[boundIndex]?.travelSolutions?.find(
          (ts) => ts.travelSolutionId === airOffer?.bounds?.[boundIndex]?.travelSolutionId
        );
        // airOffer空港間移動リスト
        const airOfferTransferList = travelSolution?.flights
          ?.map((segment, segIndex) => ({
            from: segment.arrival?.locationCode,
            to: travelSolution.flights?.[segIndex + 1]?.departure?.locationCode,
          }))
          .filter((transfer) => transfer.from !== transfer.to && transfer.from && transfer.to);
        // カート空港間移動リスト
        const cartTransferList = cartBounds[boundIndex]?.flights?.map((segment, segIndex) => ({
          from: segment.arrival?.locationCode,
          to: cartBounds[boundIndex]?.flights?.[segIndex + 1]?.departure?.locationCode,
        }));
        return airOfferTransferList?.every((airOfferTransfer) =>
          cartTransferList?.some(
            (cartTransfer) => cartTransfer.from === airOfferTransfer.from && cartTransfer.to === airOfferTransfer.to
          )
        );
      })
      // 除外条件8：往路について第1便の出発地及び最終便の到着地が異なる
      .filter(([airOfferId, airOffer]) => {
        const travelSolution = roundtripBounds[boundIndex]?.travelSolutions?.find(
          (ts) => ts.travelSolutionId === airOffer?.bounds?.[boundIndex]?.travelSolutionId
        );
        return (
          travelSolution?.originLocationCode === cartBounds[boundIndex]?.originLocationCode &&
          travelSolution?.destinationLocationCode === cartBounds[boundIndex]?.destinationLocationCode
        );
      });

    return filteredAirOffersWithIds;
  }

  /**
   * 往路復路別の出力用アップセルオファー情報作成処理
   * @param airOffersWithId [airOfferId, airOffer情報]の配列
   * @param boundIndex 往路の場合0、復路の場合1
   * @returns アップセルオファー情報の配列
   */
  private _getUpsellOffersByBound(
    airOffersWithId: [string, RoundtripOwdResponseDataAirOffersInner][],
    boundIndex: number
  ): UpsellAirOffer[] {
    const currentCartPlan = this._currentCartStoreService.CurrentCartData.data?.plan;
    const cartBounds = currentCartPlan?.airOffer?.bounds ?? [];

    const airOffers = this._roundtripOwdService.roundtripOwdData.data?.airOffers;
    const travelSolutions =
      this._roundtripOwdService.roundtripOwdData.data?.roundtripBounds?.[boundIndex]?.travelSolutions;
    const fareFamilies = this._roundtripOwdService.roundtripOwdData.data?.roundtripBounds?.[boundIndex]?.fareFamilies;

    const travelSolutionSummary =
      this._roundtripOwdService.roundtripOwdData.data?.roundtripBounds?.[boundIndex]?.travelSolutionsSummary;

    const fareFamilyCodeBeforeUpsell =
      currentCartPlan?.airOffer?.bounds?.[boundIndex]?.flights?.[0]?.fareInfos?.fareFamilyCode;
    const beforeUpgradePriorityCode = fareFamilies?.find((ff) => ff.fareFamilyCode === fareFamilyCodeBeforeUpsell)
      ?.fareFamilyWithService?.priorityCode;

    // 当該バウンドのアップセルオファーリスト
    const upsellOfferList: UpsellAirOffer[] = airOffersWithId.map(([id, airOffer]) => {
      const travelSolutionId = airOffer.bounds?.[boundIndex]?.travelSolutionId;
      const travelSolution = travelSolutions?.find((bound) => bound.travelSolutionId === travelSolutionId) ?? {};
      const fareFamilyCode = airOffer.bounds?.[boundIndex]?.fareFamilyCode;
      const ffPriorityCode = fareFamilies?.find((ff) => ff.fareFamilyCode === fareFamilyCode)?.fareFamilyWithService
        ?.priorityCode;

      const priceDiffValue =
        (airOffer.prices?.totalPrice?.total ?? 0) - (currentCartPlan?.prices?.totalPrices?.total?.value ?? 0);
      const currencyCode = currentCartPlan?.prices?.totalPrices?.total?.currencyCode;
      const priceDiffStr = this._amountFormatPipe.transform(priceDiffValue, undefined, currencyCode);

      const duration = this._dateFormatPipe.transform(
        formatSeconds(travelSolution?.duration) ?? '',
        'default_flightTotalTime'
      );
      const durationDiffSec = (cartBounds[boundIndex]?.duration ?? 0) - (travelSolution?.duration ?? 0);
      const durationDiff =
        durationDiffSec >= 0
          ? this._dateFormatPipe.transform(formatSeconds(durationDiffSec) ?? '', 'default_flightTotalTime')
          : '-' + this._dateFormatPipe.transform(formatSeconds(-durationDiffSec) ?? '', 'default_flightTotalTime');

      const aswLang = this._common.aswContextStoreService.aswContextData.lang;
      const adobeLang =
        this.masterData.langCodeConvertCache.find((langData) => langData.lang === aswLang)?.adobe_analytics ?? '';

      // 出力するアップセルオファー情報(内際共通項目のみ)
      const upsellAirOffer: UpsellAirOffer = {
        travelSolutionId: travelSolutionId,
        id: id,
        fareFamilyCode: fareFamilyCode,
        originDeparture: {
          date: this._datePipe.transform(travelSolution?.originDepartureDateTime, 'yyyy-MM-dd') ?? '',
          time: this._datePipe.transform(travelSolution?.originDepartureDateTime, 'HH:mm') ?? '',
          isTimeChanged: cartBounds[boundIndex]?.originDepartureDateTime !== travelSolution?.originDepartureDateTime,
          locationCode: travelSolution?.originLocationCode,
          locationName:
            this.masterData.airportCache['m_airport_i18n_' + travelSolution?.originLocationCode] ||
            travelSolution?.originLocationName,
        },
        destinationArrival: {
          time: this._datePipe.transform(travelSolution?.destinationArrivalDateTime, 'HH:mm') ?? '',
          isTimeChanged:
            cartBounds[boundIndex]?.destinationArrivalDateTime !== travelSolution?.destinationArrivalDateTime,
          locationCode: travelSolution?.destinationLocationCode,
          locationName:
            this.masterData.airportCache['m_airport_i18n_' + travelSolution?.destinationLocationCode] ||
            travelSolution?.destinationLocationName,
        },
        duration: duration,
        durationDiff: durationDiff,
        numberOfConnections: travelSolution?.numberOfConnections,
        numberOfConnectionsDiff:
          (cartBounds[boundIndex]?.numberOfConnections ?? 0) - (travelSolution?.numberOfConnections ?? 0),
        cabin: fareFamilies?.find((ff) => ff.fareFamilyCode === fareFamilyCode)?.fareFamilyWithService?.cabin,
        cabinBeforeUpsell: fareFamilies?.find((ff) => ff.fareFamilyCode === fareFamilyCodeBeforeUpsell)
          ?.fareFamilyWithService?.cabin,
        priceDiff: deleteHtmlTags(priceDiffStr),
        fareFamilyCodeBeforeUpsell: fareFamilyCodeBeforeUpsell,
        fareFamilyName: this.masterData.ffCache['m_ff_priority_code_i18n_' + ffPriorityCode],
        fareFamilyNameBeforeUpsell: this.masterData.ffCache['m_ff_priority_code_i18n_' + beforeUpgradePriorityCode],
        lang: adobeLang,
      };

      // 国際旅程の場合のみ、第1, 第2日本発着国際線情報を追加
      const isInternational = currentCartPlan?.airOffer?.tripType === 'international';
      if (isInternational) {
        const airOfferJpIntSegList = this.getJpIntSegList(travelSolution);
        const cartJpIntSegList = this.getJpIntSegList(cartBounds[boundIndex] as Bound);
        const upsellBound = airOffers?.[id]?.bounds as Array<RoundtripOwdResponseDataAirOffersInnerBoundsInner>;

        [upsellAirOffer.firstJapanInternationalFlight, upsellAirOffer.secondJapanInternationalFlight] =
          airOfferJpIntSegList.map((segment, index) => ({
            // 出発空港情報
            departure: {
              date: this._datePipe.transform(segment.departure?.dateTime, 'yyyy-MM-dd') ?? '',
              locationCode: segment.departure?.locationCode,
              locationName:
                this.masterData.airportCache['m_airport_i18n_' + segment.departure?.locationCode] ||
                segment.departure?.locationName,
            },
            // 到着空港情報
            arrival: {
              date: this._datePipe.transform(segment.arrival?.dateTime, 'yyyy-MM-dd') ?? '',
              locationCode: segment.arrival?.locationCode,
              locationName:
                this.masterData.airportCache['m_airport_i18n_' + segment.arrival?.locationCode] ||
                segment.arrival?.locationName,
            },
            // 便名
            flightNumber: `${segment.marketingAirlineCode}${segment.marketingFlightNumber}`,
            // キャビンクラス
            cabin: upsellBound?.[boundIndex]?.flights?.[index]?.cabin,
            // NH運航判定
            isNhGroupOperated: segment.isNhGroupOperated,
            // ACV
            aircraftConfigurationVersion: segment.aircraftConfigurationVersion,
            // アップセル判定
            isUpsold:
              this.getCabinGrade(segment.cabin) >= this.getCabinGrade(cartJpIntSegList[index]?.cabin) &&
              this.getCabinGrade(segment.cabin) >= this.getCabinGrade('ecoPremium'),
            // 発着地変更判定
            isAirportChanged:
              segment.departure?.locationCode !== cartJpIntSegList[index]?.departure?.locationCode ||
              segment.arrival?.locationCode !== cartJpIntSegList[index]?.arrival?.locationCode,
          }));
      }

      return upsellAirOffer;
    });
    return upsellOfferList;
  }

  /**
   * 日本発着国際線セグメント取得処理
   * @param bound 往路の場合0、復路の場合1
   * @returns 日本発着国際線セグメント情報の配列
   */
  getJpIntSegList(bound: Bound): BoundFlightsInner[] {
    return bound.flights?.filter((segment) => !segment.isJapanDomesticFlight) ?? [];
  }

  /**
   * キャビンクラスの等級を数値化して返却する処理
   * @param cabin 判定対象キャビンクラス
   * @returns エコノミーから順に0, 1, 2, 3
   */
  getCabinGrade(cabin?: string): number {
    const cabinList = ['eco', 'ecoPremium', 'business', 'first'];
    return cabinList.indexOf(cabin ?? '');
  }

  /**
   * アップセルオファーソート処理(バウンド単位)
   * @param upsellOffers アップセルオファー情報の配列
   * @param boundIndex 往路の場合0、復路の場合1
   * @returns ソート後のアップセルオファー情報の配列
   */
  private _sortUpsellOffersByBound(upsellOffers: UpsellAirOffer[], boundIndex: number): UpsellAirOffer[] {
    const travelSolutions =
      this._roundtripOwdService.roundtripOwdData.data?.roundtripBounds?.[boundIndex].travelSolutions;
    const airOffers = this._roundtripOwdService.roundtripOwdData.data?.airOffers;
    const cartBound = this._currentCartStoreService.CurrentCartData.data?.plan?.airOffer?.bounds?.[boundIndex] ?? {};
    const cartFlightNumberList = cartBound.flights?.map(
      (segment) => `${segment.marketingAirlineCode}${segment.marketingFlightNumber}`
    );

    // 先にソート条件2-5を適用
    const sortedUpsellOffers = [...upsellOffers]
      // ソート条件5：当該バウンドの総所要時間の昇順
      .sort((a, b) => {
        const tsA = travelSolutions?.find((ts) => ts.travelSolutionId === a.travelSolutionId);
        const tsB = travelSolutions?.find((ts) => ts.travelSolutionId === b.travelSolutionId);
        return (tsA?.duration ?? 0) < (tsB?.duration ?? 0) ? -1 : 1;
      })
      // ソート条件4：当該バウンドの乗継回数の昇順
      .sort((a, b) => {
        const tsA = travelSolutions?.find((ts) => ts.travelSolutionId === a.travelSolutionId);
        const tsB = travelSolutions?.find((ts) => ts.travelSolutionId === b.travelSolutionId);
        return (tsA?.numberOfConnections ?? 0) < (tsB?.numberOfConnections ?? 0) ? -1 : 1;
      })
      // ソート条件3：旅程全体の運賃差額の昇順 i.e. 支払総額の昇順
      .sort((a, b) => {
        const totalA = airOffers?.[a.id]?.prices?.totalPrice?.total ?? 0;
        const totalB = airOffers?.[b.id]?.prices?.totalPrice?.total ?? 0;
        return totalA < totalB ? -1 : 1;
      })
      // ソート条件2：CPDランクの昇順
      .sort((a, b) => {
        const tsIndexA = travelSolutions?.findIndex((ts) => ts.travelSolutionId === a.travelSolutionId) ?? -1;
        const tsIndexB = travelSolutions?.findIndex((ts) => ts.travelSolutionId === b.travelSolutionId) ?? -1;
        return tsIndexA < tsIndexB ? -1 : 1;
      });

    // ソート条件1：現在の旅程と同一旅程であるTravelSolutionかどうか
    // ※便名により判断
    const sameAsCurrent: UpsellAirOffer[] = [];
    const notSameAsCurrent: UpsellAirOffer[] = [];

    sortedUpsellOffers.forEach((offer) => {
      const travelSolution = travelSolutions?.find((ts) => ts.travelSolutionId === offer.travelSolutionId);
      const tsFlightNumberList = travelSolution?.flights?.map(
        (segment) => `${segment.marketingAirlineCode}${segment.marketingFlightNumber}`
      );
      const isSame = tsFlightNumberList?.every((tsFlightNumber, segIndex) => {
        tsFlightNumber === cartFlightNumberList?.[segIndex];
      });
      if (isSame) {
        sameAsCurrent.push(offer);
      } else {
        notSameAsCurrent.push(offer);
      }
    });

    return [...sameAsCurrent, ...notSameAsCurrent];
  }

  /**
   * アップセルキャンセル情報取得処理
   * @returns 往路・復路それぞれのキャンセル用airOffer
   */
  private _getCancelAirOffers(): {
    outboundCancelAirOffer?: CancelAirOffer;
    inboundCancelAirOffer?: CancelAirOffer;
  } {
    // 当該バウンドがアップセル済みの場合のみ、キャンセル用airOfferを返却する
    let outboundCancelAirOffer;
    let inboundCancelAirOffer;
    const upsellStatus = this._planReviewStoreService.PlanReviewData.upsellStatus;
    const currentAirOfferId =
      this._currentCartStoreService.CurrentCartData.data?.plan?.airOfferIds?.[0]?.offerNdcId ?? '';
    const upsellInfo = (window as any).Asw.PageOutput.Upsell;

    // 往路キャンセルの場合、キャンセル用airOfferを計算する
    const _calcOutCancelAirOffer = () => {
      if (upsellStatus.isOutboundUpselled) {
        const outboundCancelAirOfferId = this._getCombinedAirOfferId(upsellStatus.primaryAirOfferId, currentAirOfferId);
        outboundCancelAirOffer = upsellInfo?.outboundCancelAirOffer
          ? { ...upsellInfo?.outboundCancelAirOffer, id: outboundCancelAirOfferId }
          : undefined;
      }
    };
    // 復路キャンセルの場合、キャンセル用airOfferを計算する
    const _calcInCancelAirOffer = () => {
      if (upsellStatus.isInboundUpselled) {
        const inboundCancelAirOfferId = this._getCombinedAirOfferId(currentAirOfferId, upsellStatus.primaryAirOfferId);
        inboundCancelAirOffer = upsellInfo?.inboundCancelAirOffer
          ? { ...upsellInfo?.inboundCancelAirOffer, id: inboundCancelAirOfferId }
          : undefined;
      }
    };
    if (upsellStatus.upsellFunction === UpsellFunctionType.OUT_UPSELL) {
      const outboundCancelAirOfferId =
        this._getCombinedAirOfferId(upsellStatus.primaryAirOfferId, currentAirOfferId) ||
        upsellStatus.primaryAirOfferId;
      outboundCancelAirOffer = {
        id: outboundCancelAirOfferId,
        lang: this._common.aswContextStoreService.aswContextData.lang,
        upsellAirOffers: upsellInfo.outboundAirOffers?.upsellAirOffers.filter(
          (offer: any) => offer.id === upsellStatus.outUpselledAirOfferId
        ),
      };
      _calcInCancelAirOffer();
    } else if (upsellStatus.upsellFunction === UpsellFunctionType.OUT_CANCEL) {
      outboundCancelAirOffer = undefined;
      _calcInCancelAirOffer();
    } else if (upsellStatus.upsellFunction === UpsellFunctionType.IN_UPSELL) {
      const inboundCancelAirOfferId =
        this._getCombinedAirOfferId(currentAirOfferId, upsellStatus.primaryAirOfferId) ||
        // 該当するairOfferが存在しない場合、往復ともにアップセル前
        upsellStatus.primaryAirOfferId;
      inboundCancelAirOffer = {
        id: inboundCancelAirOfferId,
        lang: this._common.aswContextStoreService.aswContextData.lang,
        upsellAirOffers: upsellInfo.inboundAirOffers?.upsellAirOffers.filter(
          (offer: any) => offer.id === upsellStatus.inUpselledAirOfferId
        ),
      };
      _calcOutCancelAirOffer();
    } else if (upsellStatus.upsellFunction === UpsellFunctionType.IN_CANCEL) {
      inboundCancelAirOffer = undefined;
      _calcOutCancelAirOffer();
    }

    return {
      outboundCancelAirOffer: outboundCancelAirOffer,
      inboundCancelAirOffer: inboundCancelAirOffer,
    };
  }

  /**
   * 往路・復路のairOfferIdを受け取り、フライトとFFの一致するairOfferIdを返す処理
   * @param inboundAirOfferId 往路のairOfferId
   * @param outboundAirOfferId 復路のairOfferId
   * @returns 指定した往路・復路と同一便・同一FFのairOfferのId
   */
  private _getCombinedAirOfferId(inboundAirOfferId: string, outboundAirOfferId: string): string | void {
    const airOffers = this._roundtripOwdService.roundtripOwdData.data?.airOffers;
    const roundtripBounds = this._roundtripOwdService.roundtripOwdData.data?.roundtripBounds;
    const airOfferMapping = this._roundtripOwdService.roundtripOwdData.data?.airOfferMapping;

    const inboundTsId = airOffers?.[inboundAirOfferId]?.bounds?.[0]?.travelSolutionId;
    const inboundFFCode = airOffers?.[inboundAirOfferId]?.bounds?.[0]?.fareFamilyCode ?? '';
    const inbound = roundtripBounds?.[0]?.travelSolutions?.find((ts) => ts.travelSolutionId === inboundTsId);
    const inboundFlightList = inbound?.flights?.map(
      (segment) => `${segment.marketingAirlineCode}${segment.marketingFlightNumber}`
    );
    // 往路のフライトが一致するtravelSolution
    const matchingInboundTs = roundtripBounds?.[0]?.travelSolutions?.find((ts) =>
      ts.flights?.every(
        (segment, index) =>
          `${segment.marketingAirlineCode}${segment.marketingFlightNumber}` === inboundFlightList?.[index]
      )
    );
    const matchingInboundTsId = matchingInboundTs?.travelSolutionId ?? '';

    const outboundTsId = airOffers?.[outboundAirOfferId]?.bounds?.[1]?.travelSolutionId;
    const outboundFFCode = airOffers?.[outboundAirOfferId]?.bounds?.[1]?.fareFamilyCode ?? '';
    const outbound = roundtripBounds?.[1]?.travelSolutions?.find((ts) => ts.travelSolutionId === outboundTsId);
    const outboundFlightList = outbound?.flights?.map(
      (segment) => `${segment.marketingAirlineCode}${segment.marketingFlightNumber}`
    );
    // 復路のフライトが一致するtravelSolution
    const matchingOutboundTs = roundtripBounds?.[1]?.travelSolutions?.find((ts) =>
      ts.flights?.every(
        (segment, index) =>
          `${segment.marketingAirlineCode}${segment.marketingFlightNumber}` === outboundFlightList?.[index]
      )
    );
    const matchingOutboundTsId = matchingOutboundTs?.travelSolutionId ?? '';

    return (
      (
        (
          airOfferMapping?.[matchingInboundTsId]?.[inboundFFCode] as
            | RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInner
            | undefined
        )?.[matchingOutboundTsId] as
          | RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInnerTravelSolutionIdInner
          | undefined
      )?.[outboundFFCode] as
        | RoundtripOwdResponseDataAirOfferMappingTravelSolutionIdInnerFareFamilyCodeInnerTravelSolutionIdInnerFareFamilyCodeInner
        | undefined
    )?.airOfferId;
  }

  /**
   * アップセル適用／キャンセル用関数設定処理
   */
  setUpsellFunctions(): void {
    const _window = window as any;

    /**
     * アップセルオファー適用処理
     * @param boundIndex 対象バウンドのインデックス
     * @param airOfferId 適用するAirOfferId
     */
    _window.applyUpsell = (boundIndex: string, airOfferId: string) => {
      this._ngZone.run(() => {
        this.applyUpsell(Number(boundIndex), airOfferId, false);
      });
    };
    /**
     * アップセルキャンセル処理
     * @param boundIndex 対象バウンドのインデックス
     * @param airOfferId キャンセル用AirOfferId
     */
    _window.cancelUpsell = (boundIndex: string, airOfferId: string) => {
      this._ngZone.run(() => {
        this.applyUpsell(Number(boundIndex), airOfferId, true);
      });
    };
  }

  /**
   * アップセル適用／キャンセル用関数削除処理
   */
  deleteUpsellFunctions(): void {
    const _window = window as any;
    _window.applyUpsell = undefined;
    _window.cancelUpsell = undefined;
  }

  /**
   * アップセルオファー適用処理
   * @param boundIndex 対象バウンドのインデックス
   * @param airOfferId 適用するairOfferId
   * @param isCancel : キャンセル用に使用する場合true
   */
  applyUpsell(boundIndex: number, airOfferId: string, isCancel?: boolean): void {
    this._pageLoadingService.startLoading();
    // Prebook解除処理を実行後に処理を行う
    this._cancelPrebookStoreService.cancelPrebookNext(
      () => {
        const currentCart = this._currentCartStoreService.CurrentCartData;
        // AirOffer更新API呼び出し
        const request = {
          cartId: currentCart.data?.cartId ?? '',
          postAirOfferBody: { airOfferId: airOfferId },
          searchAirOffer: currentCart.data?.searchCriteria?.searchAirOffer,
        };
        apiEventAll(
          () => this._updateAirOffersStoreService.setUpdateAirOffersFromApi(request),
          this._updateAirOffersStoreService.getUpdateAirOffers$(),
          (response) => {
            const currentCartPlan = currentCart.data?.plan;
            // あらかじめ更新前支払総額を算出
            const prevPrice = currentCartPlan?.prices?.totalPrices?.ticketPrices?.base?.value ?? 0;

            // 片道のみのキャンセルができず両方キャンセルとなってしまったケースを判定
            const upsellStatus = this._planReviewStoreService.PlanReviewData.upsellStatus;
            const isBothCancel =
              isCancel &&
              currentCartPlan?.airOffer?.bounds?.length === 2 &&
              upsellStatus.isOutboundUpselled &&
              upsellStatus.isInboundUpselled &&
              airOfferId === upsellStatus.primaryAirOfferId;

            // 更新後のカート情報を操作中カート情報にセット
            this._currentCartStoreService.setCurrentCart(response);

            // アップセル状況を更新
            const statusToSet = { ...upsellStatus };
            if (isBothCancel) {
              // 両方キャンセルの場合
              statusToSet.isOutboundUpselled = false;
              statusToSet.isInboundUpselled = false;
            } else {
              // 片道キャンセルの場合：適用ならtrue、キャンセルならfalseを設定
              !boundIndex ? (statusToSet.isOutboundUpselled = !isCancel) : (statusToSet.isInboundUpselled = !isCancel);
            }
            if (!boundIndex) {
              !isCancel
                ? (statusToSet.upsellFunction = UpsellFunctionType.OUT_UPSELL)
                : (statusToSet.upsellFunction = UpsellFunctionType.OUT_CANCEL);
              statusToSet.outUpselledAirOfferId = !isCancel ? airOfferId : undefined;
            } else {
              !isCancel
                ? (statusToSet.upsellFunction = UpsellFunctionType.IN_UPSELL)
                : (statusToSet.upsellFunction = UpsellFunctionType.IN_CANCEL);
              statusToSet.inUpselledAirOfferId = !isCancel ? airOfferId : undefined;
            }
            this._planReviewStoreService.updatePlanReview({ upsellStatus: statusToSet });

            // 運賃差額をdeliveryInfoStoreに格納
            const priceToSet = {
              ...this._deliveryInfoStoreSvc.deliveryInformationData.planReviewInformation?.upsellAmount,
            };
            if (isBothCancel) {
              priceToSet.outbound = undefined;
              priceToSet.inbound = undefined;
            } else if (isCancel) {
              !boundIndex ? (priceToSet.outbound = undefined) : (priceToSet.inbound = undefined);
            } else {
              const upselledPrice = response.data?.plan?.prices?.totalPrices?.ticketPrices?.base?.value ?? 0;
              const priceDiff = upselledPrice - prevPrice;
              !boundIndex ? (priceToSet.outbound = priceDiff) : (priceToSet.inbound = priceDiff);
            }
            this._deliveryInfoStoreSvc.setDeliveryInformationByKey('planReviewInformation', 'upsellAmount', priceToSet);

            // アップセルが適用された旨のインフォメーション文言を出し入れ
            const upsellAppliedMsgId = 'MSG1636';
            const upsellAppliedMsg = this._alertMsgStoreService.alertMessageData.infomationMessage.find(
              (msg) => msg.contentHtml === upsellAppliedMsgId
            );
            if (!isCancel && !upsellAppliedMsg) {
              // アップセル適用時、文言非表示であれば表示する
              this._alertMsgStoreService.setAlertInfomationMessage({
                contentHtml: upsellAppliedMsgId,
                isCloseEnable: false,
                alertType: AlertType.INFOMATION,
              });
            }
            if (isCancel && upsellAppliedMsg?.contentId) {
              // キャンセル時、文言表示中であれば非表示にする
              this._alertMsgStoreService.removeAlertInfomationMessage(upsellAppliedMsg.contentId);
            }

            // 片道のみのキャンセルができなかった場合、ワーニングを表示
            if (isBothCancel) {
              const AlertMessageData: AlertMessageItem = {
                contentHtml: 'W0762',
                isCloseEnable: true,
                alertType: AlertType.WARNING,
                errorMessageId: 'W0762',
              };
              this._common.alertMessageStoreService.setAlertWarningMessage(AlertMessageData);
            }

            // 画面情報更新
            this._planReviewStoreService.updatePlanReview({ isNeedRefresh: true });
          },
          (error) => {
            const apiErr = this._common.apiError?.errors?.[0]?.code ?? '';
            this._errorsHandlerSvc.setNotRetryableError({
              errorType: ErrorType.BUSINESS_LOGIC,
              errorMsgId: isCancel ? 'E0761' : 'E0760', // applyとcancelで出し分け
              apiErrorCode: apiErr,
            });
          }
        );
      },
      () => {
        this._pageLoadingService.endLoading();
      },
      true
    );
  }

  destroy(): void {}
}
