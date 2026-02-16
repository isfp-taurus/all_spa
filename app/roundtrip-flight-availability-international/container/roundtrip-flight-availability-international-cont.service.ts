import { Injectable } from '@angular/core';
import {
  AirOffer,
  DepartureFareFamily,
  ReturnFareFamily,
  ReturnTravelSolution,
  RoundtripOwdResponse,
} from '@common/interfaces/shopping/roundtrip-owd';
import {
  FareFamilyInTravelSolution,
  RoundTrip as PreRoundTrip,
  onewayOrMulticity,
} from '../presenter/roundtrip-flight-availability-international-pres.state';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import { RoundtripFlightAvailabilityInternationalState } from '@common/store/roundtripFlightAvailabilityInternational';
import { RoundtripOwdDisplayService } from '@common/services/roundtrip-owd-display/roundtrip-owd-display-store.service';
import { RoundtripOwdState } from '@common/store/roundtrip-owd';
import { Bounds } from '@common/interfaces/shopping/roundtrip-owd/response/data/airOffers/bounds';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { getOwdRequestItinerariesFromCart, isEmptyObject } from '@common/helper';
import {
  Bound,
  CurrentCartState,
  RoundTrip,
  SearchFlightConditionForRequestState,
  searchFlightInitialState,
  SearchFlightState,
  TripType,
} from '@common/store';
import { CurrentCartStoreService, ShoppingLibService } from '@common/services';
import { HistoryPostRequestHistoryBoundsInner, HistoryPostRequestHistoryRoundtrip, Items } from 'src/sdk-search';
import { SearchFlightStateDetails } from '@common/store';
@Injectable({
  providedIn: 'root',
})
export class RoundtripFlightAvailabilityInternationalContService extends SupportComponent {
  override reload(): void {}
  override init(): void {}
  override destroy(): void {}
  /** 往復指定日空席照会(OWD)用レスポンス */
  private _owd: RoundtripOwdState = { requestIds: [] };

  constructor(
    private _common: CommonLibService,
    private _shoppingLibService: ShoppingLibService,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _roundtripOwdDisplayService: RoundtripOwdDisplayService
  ) {
    super(_common);
    this.subscribeService(
      'RoundtripFlightAvailabilityInternationalContService constructor',
      this._roundtripOwdDisplayService.getRoundtripOwdDisplayObservable(),
      (response) => {
        this._owd = response;
      }
    );
  }

  /**
   * airOfferMappingからairofferIdを取得
   * 往路のみの場合cheapestAirOfferId(最安価格)を返す
   * 復路選択済の場合、引数に復路情報を渡しairOfferIdを返す
   *
   * @param departTsId
   * @param departFfId
   * @param destinationTsId
   * @param destinationFfId
   * @returns airOfferID 該当無しの場合空文字
   */
  public getAirOfferIdFromAirOfferMapping(
    airOfferMappingMap: Map<string, any>,
    departTsId: string,
    departFfId: string,
    destinationTsId?: string,
    destinationFfId?: string
  ): string {
    destinationTsId ??= '';
    destinationFfId ??= '';

    // 往路のみ
    if (destinationTsId === '' || destinationFfId === '') {
      if (
        this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData.isRoundtrip
      ) {
        return airOfferMappingMap?.get(departTsId)?.get(departFfId)?.get('cheapestAirOfferId') ?? '';
      } else {
        return airOfferMappingMap?.get(departTsId)?.get(departFfId)?.get('airOfferId') ?? '';
      }
    } else {
      // 復路選択済で往復
      return (
        airOfferMappingMap?.get(departTsId)?.get(departFfId)?.get(destinationTsId)?.get(destinationFfId)?.airOfferId ??
        ''
      );
    }
  }

  /**
   * 画面表示用データのTS別FF情報を更新する
   * 往路バウンド、復路バウンド両者を更新する
   *
   * @param airOfferMappingMap:往路TSID⇒往路FFID⇒復路TSID⇒復路TSID⇒AirOfferIDのマップ
   * @param airOfferMap:airOfferIdをキーとするairOffer情報
   * @param ffNameMap:FF名称マップ
   * @param response :APIレスポンス
   * @param travelSolutionId: 共通RAML Boundが持つトラベルソリューションID
   * @param fareFamilyCodeList:FFCodeの配列 apiレスポンス内のairOfferMappingはFFの並びを持たないため、fareFamiliesから取得する
   * @param isDepart: 往路である場合true
   * @param selectedDestinationTsId :選択済み復路TS
   * @param selectedDestinationFfId :選択済み復路FF
   */
  public generateFareFamilyInTravelSolution(
    airOfferMappingMap: Map<string, any>,
    airOfferMap: Map<string, AirOffer>,
    ffNameMap: Map<string, string>,
    response: RoundtripOwdResponse,
    travelSolutionId: string,
    fareFamilyCodeList: string[],
    isDepart: boolean,
    selectedDestinationTsId?: string,
    selectedDestinationFfId?: string
  ): FareFamilyInTravelSolution[] {
    selectedDestinationTsId ??= '';
    selectedDestinationFfId ??= '';
    const airOfferMapping = response.data?.airOfferMapping ?? {};

    if (airOfferMapping === null) {
      return [];
    }
    // バウンド番号取得
    const boundNum = isDepart ? 0 : 1;
    // TS別FF情報 作成
    const fareFamilyInTsList: FareFamilyInTravelSolution[] = [];
    // 存在しない場合、利用不可設定
    const fareFamilyInTs = {
      isAvailable: false,
      isSelected: false,
      fareFamilyCode: '',
      cabinClassName: '',
      fareFamilyName: '',
    };

    // TS別FF情報作成
    fareFamilyCodeList.forEach((code) => {
      const fareFamilyNameFromCache = ffNameMap.get(code ?? '') ?? '';
      const airOffer = this.getAirOfferObject(airOfferMappingMap, airOfferMap, travelSolutionId, code);
      if (airOffer && airOffer.bounds) {
        let isSelected = false;
        // 選択中であるかどうか設定
        if (
          boundNum === 0 &&
          airOffer.bounds[0]?.travelSolutionId === selectedDestinationTsId &&
          airOffer.bounds[0]?.fareFamilyCode === selectedDestinationFfId
        ) {
          isSelected = true;
        }
        if (
          boundNum === 1 &&
          airOffer.bounds[1]?.travelSolutionId === selectedDestinationTsId &&
          airOffer.bounds[1]?.fareFamilyCode === selectedDestinationFfId
        ) {
          isSelected = true;
        }
        fareFamilyInTsList.push({
          isAvailable: true,
          isSelected: isSelected,
          cabinClassName: '',
          fareFamilyCode: code,
          fareFamilyName: fareFamilyNameFromCache,
          data: {
            // プロモーション適用有無
            isPromotionApplied: airOffer?.bounds[boundNum]?.totalPrice?.discount !== null ? true : false,
            // 最低価格である
            isLowestPrice: airOffer?.prices?.isCheapest ?? false,
            // 通貨記号
            currencySymbol: airOffer?.bounds[boundNum]?.totalPrice?.currencyCode ?? '',
            // 金額 (プロモーション適用ありの場合、プロモーション適用後)
            price: airOffer?.bounds[boundNum]?.totalPrice?.total ?? 0,
            // プロモーション適用前金額 プロモーション適用ありのみ設定
            originalPrice: airOffer?.bounds[boundNum]?.totalPrice?.discount?.originalTotal ?? undefined,
            // 残席状況 enough：十分空席あり available：空席あり few：残席実数 soldOut：売り切れ
            quotaType: airOffer?.bounds[boundNum]?.quotaType ?? 'soldOut',
            // 残席数
            quota: airOffer?.bounds[boundNum]?.quota ?? undefined,
          },
        });
      } else {
        // 存在しない場合、利用不可
        fareFamilyInTsList.push(fareFamilyInTs);
      }
    });

    return fareFamilyInTsList;
  }

  /**
   * 往路・復路のTSid、FFIdを基にairOfferを取得する
   *
   * @param airOfferMappingMap
   * @param airOfferMap
   * @param departTsId
   * @param departFfId
   * @param destinationTsId
   * @param destinationFfId
   * @returns
   */
  public getAirOfferObject(
    airOfferMappingMap: Map<string, any>,
    airOfferMap: Map<string, AirOffer>,
    departTsId: string,
    departFfId: string,
    destinationTsId?: string,
    destinationFfId?: string
  ): AirOffer {
    destinationTsId ??= '';
    destinationFfId ??= '';
    // airofferIdを取得
    const airOfferId = this.getAirOfferIdFromAirOfferMapping(
      airOfferMappingMap,
      departTsId,
      departFfId,
      destinationTsId,
      destinationFfId
    );

    if (airOfferId !== '') {
      const airOfferObject = airOfferMap.get(airOfferId);
      if (airOfferObject ?? false) {
        return airOfferObject ?? {};
      } else {
        return undefined ?? {};
      }
    } else {
      return undefined ?? {};
    }
  }

  /**
   * 選択中の往路復路のTSIDとFFCode
   *
   * @param outboundTSID 選択中往路TSID
   * @param outboundFFCode 選択中往路FF
   * @param returnTSID 選択中復路TSID
   * @param returnFFCode 選択中復路FF
   * @param selectAirOfferId 選択AirOfferId
   * @param selectAirOfferInfo 選択AirOffer情報
   * @returns Store情報
   */
  public setSelectTSIDandFF(
    outboundTSID?: string,
    outboundFFCode?: string,
    returnTSID?: string,
    returnFFCode?: string,
    selectAirOfferId?: string,
    selectAirOfferInfo?: AirOffer
  ): RoundtripFlightAvailabilityInternationalState {
    let setData: RoundtripFlightAvailabilityInternationalState = {};

    // 選択中往路TSID
    if (outboundTSID !== undefined) {
      setData.selectOutboundTSID = outboundTSID;
    } else if (outboundTSID === undefined) {
      setData.selectOutboundTSID =
        this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData.selectOutboundTSID;
    }

    // 選択中往路FF
    if (outboundFFCode !== undefined) {
      setData.selectOutboundFF = outboundFFCode;
    } else if (outboundFFCode === undefined) {
      setData.selectOutboundFF =
        this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData.selectOutboundFF;
    }

    // 選択中復路TSID
    if (returnTSID !== undefined) {
      setData.selectReturnTripTSID = returnTSID;
    } else if (returnTSID === undefined) {
      setData.selectReturnTripTSID =
        this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData.selectReturnTripTSID;
    }

    // 選択中復路FF
    if (returnFFCode !== undefined) {
      setData.selectReturnTripFF = returnFFCode;
    } else if (returnFFCode === undefined) {
      setData.selectReturnTripFF =
        this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData.selectReturnTripFF;
    }

    // 選択AirOfferId
    if (selectAirOfferId !== undefined) {
      setData.selectAirOfferId = selectAirOfferId;
    } else if (selectAirOfferId === undefined) {
      setData.selectAirOfferId =
        this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData.selectAirOfferId;
    }

    // 選択AirOffer情報
    if (selectAirOfferInfo !== undefined) {
      setData.selectAirOfferInfo = selectAirOfferInfo;
    } else if (selectAirOfferInfo === undefined) {
      setData.selectAirOfferInfo =
        this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData.selectAirOfferInfo;
    }

    // Store更新
    this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(setData);
    return this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;
  }

  /**
   * Storeから選択中往路TSIDを取得
   * @returns 選択中往路TSID
   */
  public getSelectOutboundTSID(): string {
    return (
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .selectOutboundTSID ?? ''
    );
  }

  /**
   * Storeから選択中往路FFCodeを取得
   * @returns 選択中往路FFCode
   */
  public getSelectOutboundFFCode(): string {
    return (
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .selectOutboundFF ?? ''
    );
  }

  /**
   * Storeから選択中復路TSIDを取得
   * @returns 選択中復路TSID
   */
  public getSelectReturnTripTSID(): string {
    return (
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .selectReturnTripTSID ?? ''
    );
  }

  /**
   * Storeから選択中復路FFCodeを取得
   * @returns 選択中復路FFCode
   */
  public getSelectReturnTripFF(): string {
    return (
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .selectReturnTripFF ?? ''
    );
  }

  /**
   * Storeから選択AirOfferIdを取得
   * @returns 選択AirOfferId
   */
  public getSelectAirOfferId(): string {
    return (
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .selectAirOfferId ?? ''
    );
  }

  /**
   * Storeから選択AirOffer情報を取得
   * @returns 選択AirOffer情報
   */
  public getSelectAirOfferInfo(): AirOffer {
    return (
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData
        .selectAirOfferInfo ?? {}
    );
  }

  /**
   * 往路変更後AirOfferId取得処理
   *
   * @param fareFamily
   * @param travelSolutionId
   * @returns
   */
  public getAfterAirOfferId(afterDepartureInfo?: DepartureFareFamily): string {
    // 往路変更後情報が存在しない場合、往路変更後AirOfferId=なしとして、往路変更後AirOfferId取得処理を終了する
    if (!afterDepartureInfo) {
      return '';
    }

    // 往復かどうか=falseの場合、往路変更後情報.airOfferIdを以下とし、往路変更後AirOfferId取得処理を終了する。
    if (
      !this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData.isRoundtrip
    ) {
      // 画面表示用データ.airOffers.<往路変更後情報.airOfferId>.isUnselectable = true の場合、なし
      if (this._owd.data?.airOffers?.[afterDepartureInfo.airOfferId].isUnselectable) {
        return '';
      }
      // 上位以外の場合、往路変更後情報.airOfferId
      return afterDepartureInfo.airOfferId;
    }
    // 以下のいずれかの場合、往路変更後AirOfferIdなしとして、往路変更後AirOfferId取得処理を終了する
    // 選択中復路TS=""(空欄)
    const selectingReturnTripTSID = this.getSelectReturnTripTSID();
    if (selectingReturnTripTSID === '') {
      return '';
    }
    // 往路変更後情報.<選択中復路TS>が存在しない
    const returnTravelSolution = afterDepartureInfo[selectingReturnTripTSID] as ReturnTravelSolution;
    if (!returnTravelSolution) {
      return '';
    }
    // 往路変更後情報.<選択中復路TS>.<選択中復路FF>が存在しない
    const returnFareFamily = returnTravelSolution?.[this.getSelectReturnTripFF()] as ReturnFareFamily;
    if (!returnFareFamily) {
      return '';
    }
    // 画面表示用データ.airOffers.<往路変更後情報.<選択中復路TS>.<選択中復路FF>.airOfferId>.isUnselectable=true
    if (this._owd.data?.airOffers?.[returnFareFamily.airOfferId ?? '']?.isUnselectable) {
      return '';
    }

    // 往路変更後情報.<選択中復路TS>.<選択中復路FF>.airOfferIdを往路変更後airOfferIdとする
    return returnFareFamily.airOfferId ?? '';
  }

  /**
   * 運賃変更案内表示判定処理
   *
   * @param befforeBounds  変更前バウンド情報=判定対象AirOffer情報.bounds[比較対象インデックス]
   * @param afterBounds  変更後バウンド情報=選択AirOffer情報.bounds[比較対象インデックス]
   * @param compareAirOfferIndex 当該バウンドインデックスが0の場合は比較対象インデックスを1、それ以外の場合は比較対象インデックスを0に設定する。
   * @returns
   */
  public faresChangeDisplayHandling(
    befforeBounds: Array<Bounds>,
    afterBounds: Array<Bounds>,
    compareAirOfferIndex: number
  ) {
    let result: boolean = false;
    // 以下、変更前バウンド情報.flightsの要素数分、繰り返し
    befforeBounds[compareAirOfferIndex].flights?.some((flight, index) => {
      // 変更前バウンド情報.flights[当該flightのインデックス].bookingClass ≠
      // 変更後バウンド情報.flights[当該flightのインデックス].bookingClassの場合、処理結果trueを返し、変更前バウンド情報.flightsの繰り返しを終了する。
      if (flight.bookingClass !== afterBounds[compareAirOfferIndex].flights?.[index].bookingClass) {
        result = true;
      }
    });
    return result;
  }

  /**
   * カート情報からの検索条件復元処理
   *
   * @param data  操作中カート情報
   * @returns リクエスト用検索条件
   */
  public convertData(data: CurrentCartState): SearchFlightConditionForRequestState {
    // 操作中カート
    const currentCart = this._currentCartStoreService.CurrentCartData.data;
    // プランの有効／無効を判定
    const isPlanValid = !isEmptyObject(currentCart?.plan ?? {});
    // travelersSummary
    const travelerSource = isPlanValid ? data.data?.plan?.travelersSummary : data.data?.previousPlan?.travelersSummary;

    const searchAirOffer = data.data?.searchCriteria?.searchAirOffer;
    const returnData: SearchFlightConditionForRequestState = {
      request: {
        itineraries: getOwdRequestItinerariesFromCart(searchAirOffer?.itineraries ?? []),
        travelers: {
          ADT: travelerSource?.numberOfTraveler?.ADT ?? 0,
          B15: travelerSource?.numberOfTraveler?.B15 ?? 0,
          CHD: travelerSource?.numberOfTraveler?.CHD ?? 0,
          INF: travelerSource?.numberOfTraveler?.INF ?? 0,
        },
        fare: data.data?.searchCriteria?.searchAirOffer?.fare?.isMixedCabin
          ? data.data?.searchCriteria?.searchAirOffer?.fare
          : {
              isMixedCabin: false,
              fareOptionType: data.data?.searchCriteria?.searchAirOffer?.fare?.fareOptionType,
              cabinClass: data.data?.searchCriteria?.searchAirOffer?.fare?.cabinClass,
              mixedCabinClasses: data.data?.searchCriteria?.searchAirOffer?.fare?.mixedCabinClasses,
            },
        promotion: data.data?.searchCriteria?.searchAirOffer?.promotion,
        hasAccompaniedInAnotherReservation: data.data?.plan?.travelersSummary?.hasAccompaniedInAnotherReservation,
        searchFormFlg: false,
      },
      requestIds: [],
    };
    return returnData;
  }

  /**
   * リクエスト用検索条件からの履歴用検索条件復元処理
   * @param data リクエスト用検索条件
   */
  public createHistoryConditionFromRequestCondition(data: SearchFlightConditionForRequestState): SearchFlightState {
    // 往復か？
    const isRoundtrip =
      (data.request.itineraries ?? []).length === 2 &&
      data.request.itineraries[0].originLocationCode === data.request.itineraries[1].destinationLocationCode &&
      data.request.itineraries[1].originLocationCode === data.request.itineraries[0].destinationLocationCode;

    // 省略できない項目があるので代わりに詰めるための初期値
    const initialState: SearchFlightState = { ...searchFlightInitialState };

    // 履歴用検索条件からroundtripを省略できないので一旦初期値を詰める
    let roundtrip: RoundTrip = { ...initialState.roundTrip };
    // 往復旅程の場合のみ実際の値を詰める
    if (isRoundtrip) {
      roundtrip = {
        // 出発空港コード
        departureOriginLocationCode: data.request.itineraries[0].originLocationCode,
        // 到着空港コード
        departureDestinationLocationCode: data.request.itineraries[0].destinationLocationCode,
        // 往路出発日
        departureDate: this.parseToDate(data.request.itineraries[0].departureDate),
        // 往路出発時間帯開始 ある場合その値、ない場合0
        departureTimeWindowFrom: this.parseToTimeNum(data.request.itineraries[0].departureTimeWindowFrom, 0),
        // 往路出発時間帯終了 ある場合その値、ない場合1439
        departureTimeWindowTo: this.parseToTimeNum(data.request.itineraries[0].departureTimeWindowTo, 1439),
        // 復路出発空港コード
        returnOriginLocationCode: data.request.itineraries[1].originLocationCode,
        // 復路到着空港コード
        returnDestinationLocationCode: data.request.itineraries[1].destinationLocationCode,
        // 復路出発日
        returnDate: this.parseToDate(data.request.itineraries[1].departureDate),
        // 復路出発時間帯開始 ある場合その値、ない場合0
        returnTimeWindowFrom: this.parseToTimeNum(data.request.itineraries[1].departureTimeWindowFrom, 0),
        // 復路出発時間帯終了 ある場合その値、ない場合1439
        returnTimeWindowTo: this.parseToTimeNum(data.request.itineraries[1].departureTimeWindowTo, 1439),
        departureConnection: {
          // 往路乗継情報.乗継地 ある場合のみその値
          connectionLocationCode: data.request.itineraries[0].connection?.locationCodes[0] ?? null,
          //往路乗継情報.最低乗継時間 ある場合のみその値
          connectionTime: data.request.itineraries[0].connection?.time ?? null,
        },
        returnConnection: {
          // 復路乗継情報.乗継地 ある場合のみその値
          connectionLocationCode: data.request.itineraries[1].connection?.locationCodes[0] ?? null,
          // 復路乗継情報.最低乗継時間 ある場合のみその値
          connectionTime: data.request.itineraries[1].connection?.time ?? null,
        },
        // 区間オプション表示 以下のいずれかがある場合true、そうでない場合false
        isOpenSearchOption:
          !!data.request.itineraries[0].departureTimeWindowFrom ||
          !!data.request.itineraries[0].departureTimeWindowTo ||
          !!data.request.itineraries[1].departureTimeWindowFrom ||
          !!data.request.itineraries[1].departureTimeWindowTo ||
          (data.request.itineraries[0].connection?.locationCodes?.length ?? 0) > 0 ||
          (data.request.itineraries[1].connection?.locationCodes?.length ?? 0) > 0,
      };
    }

    let onewayOrMultiCity: Bound[] = [];
    // 複雑旅程区間 旅程種別が1の場合のみ、リクエスト用検索条件.itinerariesを基にitinerariesのサイズ分繰り返し設定
    if (!isRoundtrip) {
      onewayOrMultiCity = data.request.itineraries.map((itinerary) => ({
        // 出発日 itineraries[繰り返しindex].departureDate
        departureDate: this.parseToDate(itinerary.departureDate),
        // 出発地 itineraries[繰り返しindex].originLocationCode
        originLocationCode: itinerary.originLocationCode,
        // 到着地 itineraries[繰り返しindex].destinationLocationCode
        destinationLocationCode: itinerary.destinationLocationCode,
        // 乗継地 設定しない
        connectionLocationCode: null,
        // 出発時間帯開始 itineraries[繰り返しindex].depatureTimeWindowFromがある場合その値、ない場合0
        departureTimeWindowFrom: this.parseToTimeNum(itinerary.departureTimeWindowFrom, 0),
        // 出発時間帯終了 itineraries[繰り返しindex].depatureTimeWindowToがある場合その値、ない場合1439
        departureTimeWindowTo: this.parseToTimeNum(itinerary.departureTimeWindowTo, 1439),
      }));
    }

    const returnData: SearchFlightState = {
      isJapanOnly: this.checkOnlyJapan(data, isRoundtrip),
      tripType: isRoundtrip ? TripType.ROUND_TRIP : TripType.ONEWAY_OR_MULTI_CITY,
      roundTrip: roundtrip,
      onewayOrMultiCity: onewayOrMultiCity,
      // 搭乗者数 リクエスト用検索条件.travelersをそのまま設定
      traveler: {
        adt: data.request.travelers.ADT,
        b15: data.request.travelers.B15,
        chd: data.request.travelers.CHD,
        inf: data.request.travelers.INF,
      },
      // 運賃情報 リクエスト用検索条件.fareを基に設定
      fare: {
        isMixedCabin: data.request.fare.isMixedCabin,
        // キャビンクラス: MixedCabinの場合往路キャビンクラス、そうでなければキャビンクラス
        cabinClass: data.request.fare.isMixedCabin
          ? data.request.fare.mixedCabinClasses?.departureCabinClass ?? ''
          : data.request.fare.cabinClass ?? '',
        // 運賃オプション: MixedCabin==falseの場合に設定
        fareOptionType: data.request.fare.isMixedCabin ? '' : data.request.fare.fareOptionType ?? '',
        // 復路キャビンクラス: MixedCabinの場合に設定
        returnCabinClass: data.request.fare.isMixedCabin
          ? data.request.fare.mixedCabinClasses?.returnCabinClass ?? ''
          : '',
      },
      // プロモーション情報 リクエスト用検索条件.promotionをそのまま設定
      promotion: {
        code: data.request.promotion?.code ?? '',
      },
      // 追加処理情報 設定しない (ここでは省略不可なのでinitialStateを詰める)
      searchPreferences: { ...initialState.searchPreferences },
      // 最安額連携情報 設定しない
      lowestPrice: { ...initialState.lowestPrice },
      // 画面表示用情報
      displayInformation: {
        // 前後日付表示オプション false
        compareFaresNearbyDates: false,
        nextPage: '',
      },
      // 別予約同行者有無 リクエスト用検索条件.hasAccompaniedInAnotherReservation
      hasAccompaniedInAnotherReservation: data.request.hasAccompaniedInAnotherReservation ?? null,
      dcsMigrationDateStatus: initialState.dcsMigrationDateStatus,
    };
    return returnData;
  }

  /** 国内単独旅程判定処理（true: 国内のみ, false:　海外旅程を含む） */
  private checkOnlyJapan(state: SearchFlightConditionForRequestState, isRoundtrip: boolean): boolean {
    let preRoundTrip: PreRoundTrip | undefined;
    let preOnewayOrMulticity: Array<onewayOrMulticity> | undefined;
    // 往復の場合
    if (isRoundtrip) {
      preRoundTrip = {
        departureOriginLocationCode: state.request.itineraries[0].originLocationCode,
        departureConnectionLocationCode: state.request.itineraries[0].destinationLocationCode,
        departureDestinationLocationCode: state.request.itineraries[1].originLocationCode,
        returnConnectionLocationCode: state.request.itineraries[1].destinationLocationCode,
      };
    } else {
      preOnewayOrMulticity = state.request.itineraries.map((data) => {
        return {
          originLocationCode: data.originLocationCode,
          destinationLocationCode: data.destinationLocationCode,
        };
      });
    }
    return this._shoppingLibService.checkJapanOnlyTrip(preRoundTrip, preOnewayOrMulticity);
  }

  // Date型に変換
  public parseToDate(dateString?: string): Date | null {
    if (dateString) {
      const ymdList = dateString.split('-').map((str) => Number(str));
      return new Date(ymdList[0], ymdList[1] - 1, ymdList[2]);
    }
    return null;
  }

  /**
   * HH:mm:ss表記の時刻から分単位時刻の数値に変換
   * @param hhmmssTime HH:mm:ss表記の時刻
   * @param defaultTime 時刻が存在しない場合のデフォルト値
   * @returns 0以上1439(23時59分)以下の数値
   */
  public parseToTimeNum(hhmmssTime: string | undefined, defaultTime: number): number {
    if (hhmmssTime === undefined) {
      return defaultTime;
    }
    const [hours, minutes, seconds] = hhmmssTime.split(':');
    return 60 * Number(hours) + Number(minutes);
  }

  /** お気に入り登録済みチェック処理 */
  public checkIsRegisteredFavorite(favoriteList: Items[], searchFlight?: SearchFlightStateDetails): boolean {
    for (const favorite of favoriteList) {
      // 以下の条件を全て満たす場合、お気に入り登録済にtrueを設定し、繰り返し処理を終了する。

      // 履歴用検索条件.旅程種別=当該お気に入り情報.tripType
      const _favoriteTripType = favorite?.tripType === 'roundtrip' ? 0 : 1;
      const checkTripTypeFlg = searchFlight?.tripType === _favoriteTripType;
      // 以下のいずれかの条件を満たす
      const checkSearchConditionAndFavoriteFlg = this.checkSearchConditionAndFavorite(favorite, searchFlight);
      // 以下の項目が全て一致する
      const checkSearchConditionAndFavoriteOtherItemsFlg = this.checkSearchConditionAndFavoriteOtherItems(
        favorite,
        searchFlight
      );
      if (checkTripTypeFlg && checkSearchConditionAndFavoriteFlg && checkSearchConditionAndFavoriteOtherItemsFlg) {
        return true;
      }
    }
    return false;
  }

  /** 以下のいずれかの条件を満たす
   * @params 履歴・お気に入り情報取得レスポンス.お気に入り情報リスト要素の情報
   * @retrun 条件を満ちる結果
   */
  public checkSearchConditionAndFavorite(favorite: Items, searchFlight?: SearchFlightStateDetails): boolean {
    // 当該お気に入り情報.roundtrip配下
    const favoriteRoundTrip = favorite.roundtrip;
    // 履歴用検索条件.往復旅程区間
    const searchConditionRoundTrip = searchFlight?.roundTrip;
    // 当該お気に入り情報.bounds配下
    const favoriteBounds = favorite.bounds;
    // 履歴用検索条件.複雑旅程区間配下
    const searchConditionOnewayOrMulticity = searchFlight?.onewayOrMultiCity;

    // 履歴用検索条件.旅程種別=”roundtrip”(往復旅程)、かつ以下の項目が全て一致する
    if (
      searchFlight?.tripType === 0 &&
      searchConditionRoundTrip?.departureOriginLocationCode === favoriteRoundTrip?.originLocationCode &&
      searchConditionRoundTrip?.departureDestinationLocationCode === favoriteRoundTrip?.destinationLocationCode &&
      this.checkTimeWindowAndConnection(searchConditionRoundTrip, favoriteRoundTrip)
    ) {
      return true;
    }

    // 履歴用検索条件.旅程種別=”onewayOrMulticity”(片道または複雑旅程)、
    else if (searchFlight?.tripType === 1 && searchConditionOnewayOrMulticity?.length === favoriteBounds?.length) {
      // かつ履歴用検索条件.複雑旅程区間の要素数=当該お気に入り情報.boundsの要素数、かつ各要素の以下の項目が全て一致する
      return this.checkSearchConditionAndFavoriteBounds(searchConditionOnewayOrMulticity, favoriteBounds);
    }
    return false;
  }

  private checkTimeWindowAndConnection(
    searchConditionRoundTrip: RoundTrip | undefined,
    favoriteRoundTrip: HistoryPostRequestHistoryRoundtrip | undefined
  ): boolean {
    let departureTimeWindowFromFlag = false;
    let departureTimeWindowToFlag = false;
    let returnTimeWindowFromFlag = false;
    let returnTimeWindowToFlag = false;
    let departureConnectionLocationCodeFlag = false;
    let departureConnectionTimeFlag = false;
    let returnConnectionLocationCodeFlag = false;
    let returnConnectionTimeFlag = false;

    if (
      searchConditionRoundTrip?.departureTimeWindowFrom === 0 &&
      searchConditionRoundTrip?.departureTimeWindowTo === 1439 &&
      !favoriteRoundTrip?.departureTimeWindowFrom &&
      !favoriteRoundTrip?.departureTimeWindowTo
    ) {
      departureTimeWindowFromFlag = true;
      departureTimeWindowToFlag = true;
    } else {
      departureTimeWindowFromFlag =
        searchConditionRoundTrip?.departureTimeWindowFrom ===
        this.convertTimeOnlyCharactersToNumber(favoriteRoundTrip?.departureTimeWindowFrom);

      departureTimeWindowToFlag =
        searchConditionRoundTrip?.departureTimeWindowTo ===
        this.convertTimeOnlyCharactersToNumber(favoriteRoundTrip?.departureTimeWindowTo);
    }

    if (
      searchConditionRoundTrip?.returnTimeWindowFrom === 0 &&
      searchConditionRoundTrip?.returnTimeWindowTo === 1439 &&
      !favoriteRoundTrip?.returnTimeWindowFrom &&
      !favoriteRoundTrip?.returnTimeWindowTo
    ) {
      returnTimeWindowFromFlag = true;
      returnTimeWindowToFlag = true;
    } else {
      returnTimeWindowFromFlag =
        searchConditionRoundTrip?.returnTimeWindowFrom ===
        this.convertTimeOnlyCharactersToNumber(favoriteRoundTrip?.returnTimeWindowFrom);

      returnTimeWindowToFlag =
        searchConditionRoundTrip?.returnTimeWindowTo ===
        this.convertTimeOnlyCharactersToNumber(favoriteRoundTrip?.returnTimeWindowTo);
    }

    if (
      searchConditionRoundTrip?.departureConnection?.connectionLocationCode &&
      favoriteRoundTrip?.departureConnectionLocationCode
    ) {
      departureConnectionLocationCodeFlag =
        searchConditionRoundTrip?.departureConnection?.connectionLocationCode ===
        favoriteRoundTrip?.departureConnectionLocationCode;
    } else if (
      !searchConditionRoundTrip?.departureConnection?.connectionLocationCode &&
      !favoriteRoundTrip?.departureConnectionLocationCode
    ) {
      departureConnectionLocationCodeFlag = true;
    }

    if (searchConditionRoundTrip?.departureConnection?.connectionTime && favoriteRoundTrip?.departureConnectionTime) {
      departureConnectionTimeFlag =
        searchConditionRoundTrip?.departureConnection?.connectionTime === favoriteRoundTrip?.departureConnectionTime;
    } else if (
      searchConditionRoundTrip?.departureConnection?.connectionTime === 0 ||
      favoriteRoundTrip?.departureConnectionTime === 0
    ) {
      departureConnectionTimeFlag =
        searchConditionRoundTrip?.departureConnection?.connectionTime === favoriteRoundTrip?.departureConnectionTime;
    } else if (
      !searchConditionRoundTrip?.departureConnection?.connectionTime &&
      !favoriteRoundTrip?.departureConnectionTime
    ) {
      departureConnectionTimeFlag = true;
    }

    if (
      searchConditionRoundTrip?.returnConnection?.connectionLocationCode &&
      favoriteRoundTrip?.returnConnectionLocationCode
    ) {
      returnConnectionLocationCodeFlag =
        searchConditionRoundTrip?.returnConnection?.connectionLocationCode ===
        favoriteRoundTrip?.returnConnectionLocationCode;
    } else if (
      !searchConditionRoundTrip?.returnConnection?.connectionLocationCode &&
      !favoriteRoundTrip?.returnConnectionLocationCode
    ) {
      returnConnectionLocationCodeFlag = true;
    }

    if (searchConditionRoundTrip?.returnConnection?.connectionTime && favoriteRoundTrip?.returnConnectionTime) {
      returnConnectionTimeFlag =
        searchConditionRoundTrip?.returnConnection?.connectionTime === favoriteRoundTrip?.returnConnectionTime;
    } else if (
      searchConditionRoundTrip?.returnConnection?.connectionTime === 0 ||
      favoriteRoundTrip?.returnConnectionTime === 0
    ) {
      returnConnectionTimeFlag =
        searchConditionRoundTrip?.returnConnection?.connectionTime === favoriteRoundTrip?.returnConnectionTime;
    } else if (
      !searchConditionRoundTrip?.returnConnection?.connectionTime &&
      !favoriteRoundTrip?.returnConnectionTime
    ) {
      returnConnectionTimeFlag = true;
    }

    if (
      departureTimeWindowFromFlag &&
      departureTimeWindowToFlag &&
      returnTimeWindowFromFlag &&
      returnTimeWindowToFlag &&
      departureConnectionLocationCodeFlag &&
      departureConnectionTimeFlag &&
      returnConnectionLocationCodeFlag &&
      returnConnectionTimeFlag
    ) {
      return true;
    } else {
      return false;
    }
  }

  // 履歴用検索条件.複雑旅程区間配下と当該お気に入り情報.bounds配下各要素チェック
  private checkSearchConditionAndFavoriteBounds(
    searchConditionOnewayOrMulticity: Array<Bound> | undefined,
    favoriteBounds: Array<HistoryPostRequestHistoryBoundsInner> | undefined
  ): boolean {
    let checkFlg: boolean = false;
    let checkFlgArr: boolean[] = [];

    if (searchConditionOnewayOrMulticity && favoriteBounds) {
      if (searchConditionOnewayOrMulticity.length === favoriteBounds.length) {
        for (let i = 0; i < searchConditionOnewayOrMulticity.length; i++) {
          let arrFlg = false;
          if (
            searchConditionOnewayOrMulticity[i].originLocationCode === favoriteBounds[i].originLocationCode &&
            searchConditionOnewayOrMulticity[i].destinationLocationCode === favoriteBounds[i].destinationLocationCode
          ) {
            if (
              this.checkTimeWindow(
                searchConditionOnewayOrMulticity[i].departureTimeWindowFrom,
                searchConditionOnewayOrMulticity[i].departureTimeWindowTo,
                favoriteBounds[i].departureTimeWindowFrom,
                favoriteBounds[i].departureTimeWindowTo
              )
            ) {
              arrFlg = true;
            }
          }
          checkFlgArr.push(arrFlg);
        }
      }
    }
    checkFlg = checkFlgArr.length > 0 ? !checkFlgArr.includes(false) : false;
    return checkFlg;
  }

  private checkTimeWindow(
    HistoryDepartureTimeWindowFrom: number | null,
    HistoryDepartureTimeWindowTo: number | null,
    favoriteDepartureTimeWindowFrom: string | undefined,
    favoriteDepartureTimeWindowTo: string | undefined
  ): boolean {
    let WindowFromFlag = false;
    let WindowToFlag = false;

    if (
      HistoryDepartureTimeWindowFrom === 0 &&
      HistoryDepartureTimeWindowTo === 1439 &&
      !favoriteDepartureTimeWindowFrom &&
      !favoriteDepartureTimeWindowTo
    ) {
      WindowFromFlag = true;
      WindowToFlag = true;
    } else if (
      (HistoryDepartureTimeWindowFrom || HistoryDepartureTimeWindowFrom === 0) &&
      HistoryDepartureTimeWindowTo
    ) {
      WindowFromFlag =
        this.convertNumberToTimeString(HistoryDepartureTimeWindowFrom) === favoriteDepartureTimeWindowFrom;
      WindowToFlag = this.convertNumberToTimeString(HistoryDepartureTimeWindowTo) === favoriteDepartureTimeWindowTo;
    }

    if (WindowFromFlag && WindowToFlag) {
      return true;
    } else {
      return false;
    }
  }

  /** 数値型をHH:mm:ss形式に変換する */
  private convertNumberToTimeString(value: number) {
    return new Date(value * 60 * 1000).toISOString().substring(11, 19);
  }

  /**
   * HH:mm:ss形式のものをHH:mm:ssに関して数値に変換する
   * @param dateTime 日時
   * @returns 日時をHH:mm:ssに関して数値に変換したもの
   */
  private convertTimeOnlyCharactersToNumber(dateTime: string | undefined): number | undefined {
    if (!dateTime) {
      return undefined;
    }
    // 時
    const hour = Number(dateTime.slice(0, 2));
    // 分
    const minutes = Number(dateTime.slice(3, 5));

    return hour * 60 + minutes;
  }

  /* 履歴用検索条件と当該お気に入り情報要素チェック
   * @params 履歴・お気に入り情報取得レスポンス.お気に入り情報リスト要素分情報
   * @retrun 条件を満ちる結果  */
  public checkSearchConditionAndFavoriteOtherItems(favorite: Items, searchFlight?: SearchFlightStateDetails): boolean {
    let checkFlg: boolean = false;
    let checkFlgWhenMixedCabinIsTrueFlg: boolean = false;
    let checkFlgWhenMixedCabinIsFalseFlg: boolean = false;
    if (searchFlight?.fare?.isMixedCabin === favorite?.fare?.isMixedCabin) {
      if (!searchFlight?.fare?.isMixedCabin) {
        checkFlgWhenMixedCabinIsTrueFlg =
          searchFlight?.fare.cabinClass === favorite?.fare?.cabinClass &&
          searchFlight?.fare.fareOptionType === favorite?.fare?.fareOptionType;
      } else {
        checkFlgWhenMixedCabinIsFalseFlg =
          searchFlight?.fare?.cabinClass === favorite?.fare?.mixedCabinClasses?.departureCabinClass &&
          searchFlight?.fare?.returnCabinClass === favorite?.fare?.mixedCabinClasses?.returnCabinClass;
      }
      checkFlg =
        searchFlight?.traveler.adt === favorite?.travelers?.ADT &&
        searchFlight?.traveler.b15 === favorite?.travelers?.B15 &&
        searchFlight?.traveler.adt === favorite?.travelers?.ADT &&
        searchFlight?.traveler.chd === favorite?.travelers?.CHD &&
        searchFlight?.promotion.code === favorite?.promotionCode &&
        (checkFlgWhenMixedCabinIsTrueFlg || checkFlgWhenMixedCabinIsFalseFlg);
    }
    return checkFlg;
  }
}
