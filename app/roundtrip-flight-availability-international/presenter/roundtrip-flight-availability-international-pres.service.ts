import { Injectable } from '@angular/core';
import { CriteoAlignmentInfo } from '@common/components/shopping/criteo-alignment/criteo-alignment.state';
import { RoundtripFlightAvailabilityInternationalService } from '@common/services/roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.service';
import { RoundtripFlightAvailabilityInternationalState } from '@common/store/roundtripFlightAvailabilityInternational';
import {
  AswMasterService,
  CommonLibService,
  ErrorsHandlerService,
  LoggerDatadogService,
  PageLoadingService,
  SystemDateService,
} from '@lib/services';
import { TripType } from '@common/interfaces';
import { MASTER_TABLE } from '@conf/asw-master.config';
import { M_OFFICE } from '@common/interfaces/common/m_office';
import {
  AcvItem,
  DisplayInfoJSON,
  FareInfo,
  FlightDetailHeader,
  FlightDetailSegment,
  MixedCabinInfo,
  OnewayOrMulticityBound,
  RoundTripInfo,
  TripTypeInfo,
} from './roundtrip-flight-availability-international-pres.state';
import { DeviceType, ErrorType, NotRetryableErrorModel, PageType, RetryableError } from '@lib/interfaces';
import {
  Bound,
  ComplexItinerary,
  FavoritePostRequest,
  HistoryPostRequest,
  HistoryPostRequestHistory,
  HistoryPostRequestHistoryBoundsInner,
  HistoryPostRequestHistoryRoundtrip,
  NumberOfTravelers,
  RoundtripOwdRequestItinerariesInner,
  SearchApiService,
  Type8,
  Type8MixedCabinClasses,
  Type9,
} from 'src/sdk-search';
import { M_AIRLINES } from '@common/interfaces/common/m_airline.interface';
import { DateFormatPipe, StaticMsgPipe } from '@lib/pipes';
import { AirportI18nJoinByAirportCodeCache } from '@common/services/shopping/shopping-lib/shopping-lib.state';
import { M_EQUIPMENT, M_EQUIPMENTS } from '@common/interfaces/common/m_equipment.interface';
import { M_AIRCRAFT_CABIN, M_AIRCRAFT_CABIN_MAPS } from '@common/interfaces/common/m_aircraft_cabin.interface';
import { CreateCartRequest, PatchUpdateAirOffersRequest } from 'src/sdk-reservation';
import {
  CancelPrebookService,
  ComplexFlightCalendarStoreService,
  CreateCartStoreService,
  CurrentCartStoreService,
  DcsDateService,
  DeliveryInformationStoreService,
  UpdateAirOffersStoreService,
} from '@common/services';
import { Router } from '@angular/router';
import { RoutesResRoutes } from '@conf/routes.config';
import { SearchFlightConditionForRequest, SearchFlightState, SearchFlightStateDetails } from '@common/store';
import { FavoritePostService } from '@common/services/api-store/sdk-search/favorite-post/favorite-post-store.service';
import { SupportClass } from '@lib/components/support-class';
import { ComplexFlightAvailabilityStoreService } from '@app/complex-flight-availability/service/store.service';
import { SearchFlightConditionForRequestService } from '@common/services';
import { ShoppingLibService } from '@common/services';
import { CabinCache } from '@common/interfaces/shopping/cabinClass/cabinClass';
import { CabinCacheList } from '@common/interfaces/shopping/cabinClass/cabinClassList';
import { apiEventAll } from '@common/helper';
import { AppConstants } from '@conf/app.constants';
import { convertStringToDate } from '@lib/helpers';
import { ErrorCodeConstants } from '@conf/app.constants';

// 言語コード
const LANG_CODE = {
  JA: 'ja',
  EN: 'en',
  ZH: 'zh',
  KO: 'ko',
  KR: 'kr',
  CN: 'cn',
};

@Injectable({
  providedIn: 'root',
})
export class RoundtripFlightAvailabilityInternationalPresService extends SupportClass {
  public appConstants = AppConstants;

  /** 往復空席照会結果(国際)画面のStore */
  private _R01P030Store: RoundtripFlightAvailabilityInternationalState = {};
  /** カウチ対象便ACVコードリスト */
  public couchAcvCodeList: string[] = [];

  constructor(
    private _common: CommonLibService,
    private _aswMasterSvc: AswMasterService,
    private _roundtripFlightAvailabilityInternationalService: RoundtripFlightAvailabilityInternationalService,
    private _dateFormatPipe: DateFormatPipe,
    private _staticMsgPipe: StaticMsgPipe,
    private _createCartStoreService: CreateCartStoreService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _deliveryInfoStoreService: DeliveryInformationStoreService,
    private _router: Router,
    private _cancelPrebookService: CancelPrebookService,
    private _updateAirOffersStoreService: UpdateAirOffersStoreService,
    private _favoritePostService: FavoritePostService, // お気に入り登録API(store)：favorite
    private _complexFlightAvailabilityStoreService: ComplexFlightAvailabilityStoreService,
    private _complexFlightCalendarStoreService: ComplexFlightCalendarStoreService,
    private _searchApiService: SearchApiService,
    private _searchFlightConditionForRequestService: SearchFlightConditionForRequestService,
    private _shoppingLivService: ShoppingLibService,
    private _systemDateSvc: SystemDateService,
    private _pageLoadingService: PageLoadingService,
    private _dcsDateService: DcsDateService,
    private _loggerSvc: LoggerDatadogService
  ) {
    super();
    this._R01P030Store =
      this._roundtripFlightAvailabilityInternationalService.roundtripFlightAvailabilityInternationalData;

    if (this._common.aswContextStoreService.aswContextData.posCountryCode === 'MX') {
      this.couchAcvCodeList = this._shoppingLivService.getcouchAcvCodeList();
    }
  }

  destroy() {}

  /**
   * criteo連携情報の作成
   */
  public createCriteoAlignmentInfo(): CriteoAlignmentInfo {
    return {
      /** 区間 */
      criteoSegmentCode: this.getSegmentCode(),
      /** 端末種別 */
      criteoDeviceType: this.getDeviceType(),
      /** 往路出発日 */
      criteoDepartureDate: this.getDepartureDate(),
      /** 復路出発日 */
      criteoArrivalDate: this.getArrivalDate(),
      /** CONNECTION_KIND */
      criteoConnectionKind: this.getConnectionKind(),
      /** 言語コード */
      criteoLanguageCode: this._common.aswContextStoreService.aswContextData.lang,
      /** 片道旅程/往復旅程フラグ */
      criteoSearchMode: this.getSearchMode(),
      /** 大人人数 */
      criteoAdultCount: this.getAdultCount(),
      /** 小児人数 */
      criteoChildCount: String(this._R01P030Store.searchFlight?.traveler.chd ?? 0),
      /** 幼児人数 */
      criteoInfantCount: String(this._R01P030Store.searchFlight?.traveler.inf ?? 0),
      /** 運賃種別 */
      criteoBoardingClass: this.getBoardingClass(),
      /** 運賃オプション */
      criteoBoardingClassOption: this._R01P030Store.searchFlight?.fare.isMixedCabin
        ? ''
        : this._R01P030Store.searchFlight?.fare.fareOptionType,
      /** 運賃総額 */
      criteoTotalAmount: '',
      /** トランザクションID */
      criteoTransactionId: '',
      /** 顧客区分 */
      criteoCustomerType: this._common.isNotLogin() ? '0' : '1',
    };
  }

  /**
   * criteo連携情報 : 区間
   * @returns
   */
  private getSegmentCode(): string {
    // 履歴用検索条件.旅程種別=”roundtrip”
    if (this._R01P030Store.searchFlight?.tripType === TripType.ROUND_TRIP) {
      // 履歴用検索条件.往復旅程区間.出発地(照会用空港コード)+“_”(半角アンダースコア)+(照会用空港コード)
      return (
        this._R01P030Store.searchFlight.roundTrip.departureOriginLocationCode +
        '_' +
        this._R01P030Store.searchFlight.roundTrip.returnOriginLocationCode
      );
    }

    // 履歴用検索条件.旅程種別=”onewayOrMulticity”
    if (this._R01P030Store.searchFlight?.tripType === TripType.ONEWAY_OR_MULTICITY) {
      // 履歴用検索条件.複雑旅程区間[0].出発地(照会用空港コード)+“_”(半角アンダースコア)+履歴用検索条件.複雑旅程区間[0].到着地(照会用空港コード)
      return (
        this._R01P030Store.searchFlight.onewayOrMultiCity[0].originLocationCode +
        '_' +
        this._R01P030Store.searchFlight.onewayOrMultiCity[0].destinationLocationCode
      );
    }
    return '';
  }

  /**
   * criteo連携情報 : 端末種別
   * @returns
   */
  private getDeviceType(): string {
    if (
      this._common.aswContextStoreService.aswContextData.deviceType === DeviceType.PC ||
      this._common.aswContextStoreService.aswContextData.deviceType === DeviceType.TABLET
    ) {
      return 'd';
    }
    if (this._common.aswContextStoreService.aswContextData.deviceType === DeviceType.SMART_PHONE) {
      return 'm';
    }
    return '';
  }

  /**
   * criteo連携情報 : 往路出発日
   * @returns
   */
  private getDepartureDate(): string {
    // 履歴用検索条件.旅程種別=”roundtrip”
    if (this._R01P030Store.searchFlight?.tripType === TripType.ROUND_TRIP) {
      // 履歴用検索条件.往復旅程区間.往路出発日
      return String(this._R01P030Store.searchFlight.roundTrip.departureDate);
    }

    // 履歴用検索条件.旅程種別=”onewayOrMulticity”
    if (this._R01P030Store.searchFlight?.tripType === TripType.ONEWAY_OR_MULTICITY) {
      // 履歴用検索条件.複雑旅程区間[0].出発日
      return String(this._R01P030Store.searchFlight.onewayOrMultiCity[0].departureDate);
    }
    return '';
  }

  /**
   * criteo連携情報 : 復路出発日
   * @returns
   */
  private getArrivalDate(): string {
    // 履歴用検索条件.旅程種別=”roundtrip”
    if (this._R01P030Store.searchFlight?.tripType === TripType.ROUND_TRIP) {
      // 履歴用検索条件.往復旅程区間.復路出発日
      return String(this._R01P030Store.searchFlight.roundTrip.returnDate);
    }

    // 履歴用検索条件.旅程種別=”onewayOrMulticity”
    if (this._R01P030Store.searchFlight?.tripType === TripType.ONEWAY_OR_MULTICITY) {
      // 履歴用検索条件.複雑旅程区間[1].出発日
      if (this._R01P030Store.searchFlight.onewayOrMultiCity[1]) {
        return String(this._R01P030Store.searchFlight.onewayOrMultiCity[1].departureDate);
      }
    }
    return '';
  }

  /**
   * criteo連携情報 : CONNECTION_KIND
   * @returns
   */
  private getConnectionKind(): string {
    // ユーザ共通.操作オフィスコード=オフィスコードとなるASWDB(マスタ)のオフィス.ASWTOP識別
    let result = '';
    let _officeAll: M_OFFICE[] = this._aswMasterSvc.aswMaster[MASTER_TABLE.OFFICE_ALL.key];
    _officeAll.forEach((officeAll: M_OFFICE) => {
      if (officeAll.office_code === this._common.aswContextStoreService.aswContextData.pointOfSaleId) {
        result = officeAll.connection_kind ?? '';
      }
    });
    return result;
  }

  /**
   * criteo連携情報 : 片道旅程/往復旅程フラグ
   * @returns
   */
  private getSearchMode(): string {
    let length = 0;
    if (this._R01P030Store.searchFlight?.onewayOrMultiCity) {
      length = this._R01P030Store.searchFlight.onewayOrMultiCity.length;
    }
    // 以下の条件を全て満たす
    // 履歴用検索条件.旅程種別=”onewayOrMulticity”
    // 履歴用検索条件.複雑旅程区間の要素数=1	”ONE_WAY”
    if (this._R01P030Store.searchFlight?.tripType === TripType.ONEWAY_OR_MULTICITY && length === 1) {
      return 'ONE_WAY';
    } else {
      return 'ROUND_TRIP';
    }
  }

  /**
   * criteo連携情報 : 大人人数
   * @returns
   */
  private getAdultCount(): string {
    // 履歴用検索条件.搭乗者数.大人人数 + 履歴用検索条件.搭乗者数.ヤングアダルト人数
    let result = this._R01P030Store.searchFlight?.traveler.adt ?? 0;
    result = result + (this._R01P030Store.searchFlight?.traveler.b15 ?? 0);
    return String(result);
  }

  /**
   * criteo連携情報 : 運賃種別
   * @returns
   */
  private getBoardingClass(): string {
    if (this._R01P030Store.searchFlight?.fare.isMixedCabin) {
      // 履歴用検索条件.運賃情報.MixedCabin利用有無=true

      // 以下の処理にて求めた値
      // 1 履歴用検索条件.運賃情報.キャビンクラスに応じた以下の数値を往路キャビンランクとする。
      // 1.1 “first”(ファースト)の場合、3
      // 1.2 “business”(ビジネス)の場合、2
      // 1.3 “ecoPremium”(プレミアムエコノミー)の場合、1
      // 1.4 “eco”(エコノミー)の場合、0
      // 2 履歴用検索条件.運賃情報.復路キャビンクラスについて、往路キャビンランクと同様の処理にて求めた数値を復路キャビンランクとする。
      // 3 往路キャビンランク≧復路キャビンランクの場合は履歴用検索条件.運賃情報.キャビンクラス、そうでない場合は履歴用検索条件.運賃情報.復路キャビンクラスを出力する値とする。
      if (this._R01P030Store.searchFlight?.fare.cabinClass === 'first') {
        return '3';
      }
      if (this._R01P030Store.searchFlight?.fare.cabinClass === 'business') {
        return '2';
      }
      if (this._R01P030Store.searchFlight?.fare.cabinClass === 'ecoPremium') {
        return '1';
      }
      if (this._R01P030Store.searchFlight?.fare.cabinClass === 'eco') {
        return '0';
      }

      return '';
    } else {
      // 履歴用検索条件.運賃情報.MixedCabin利用有無=false
      // 履歴用検索条件.キャビンクラス
      return this._R01P030Store.searchFlight?.fare.cabinClass ?? '';
    }
  }

  /**
   * 画面情報JSONの作成
   * @param itineraries 旅程検索条件
   * @param searchFlightObj 履歴用検索条件
   * @param flightType 検索結果旅程種別
   * @param fmfFlg 呼び出し元がFmFか否かのフラグ
   * @returns 画面情報JSON
   */
  public createDisplayInfoJSON(
    itineraries: ComplexItinerary[] | RoundtripOwdRequestItinerariesInner[] | undefined,
    searchFlightObj: SearchFlightState | undefined,
    flightType: boolean,
    fmfFlg: boolean
  ): DisplayInfoJSON {
    const tripType = this.getTripType(itineraries, searchFlightObj);

    if (fmfFlg) {
      return {
        /** 運賃情報 */
        fare: this.getFareInfo(searchFlightObj, fmfFlg),
        /** 国内単独旅程区分 */
        isDomesticTrip: flightType ?? false,
      };
    }
    if (tripType === 'roundtrip') {
      return {
        /** 旅程タイプ */
        tripType: tripType,
        /** 往復旅程情報 */
        roundtrip: this.getRoundTripInfo(tripType, searchFlightObj),
        /** 運賃情報 */
        fare: this.getFareInfo(searchFlightObj, fmfFlg),
        /** 国内単独旅程区分 */
        isDomesticTrip: flightType ?? false,
      };
    } else {
      return {
        /** 旅程タイプ */
        tripType: tripType,
        /** 片道または複雑旅程バウンドリスト */
        bounds: this.getBounds(tripType, searchFlightObj),
        /** 運賃情報 */
        fare: this.getFareInfo(searchFlightObj, fmfFlg),
        /** 国内単独旅程区分 */
        isDomesticTrip: flightType ?? false,
      };
    }
  }

  /**
   * 画面情報JSON : 旅程タイプ
   * @returns
   */
  private getTripType(
    itineraries: ComplexItinerary[] | RoundtripOwdRequestItinerariesInner[] | undefined,
    searchFlightObj: SearchFlightState | undefined
  ): TripTypeInfo {
    // 履歴用検索条件.旅程種別=“roundtrip”(往復旅程)
    if (searchFlightObj?.tripType === TripType.ROUND_TRIP) {
      return 'roundtrip';
    }

    let itinerariesLength = itineraries?.length ?? 0;
    // 履歴用検索条件.旅程種別=”onewayOrMulticity”、かつリクエスト用検索条件.itinerariesの要素数=1
    if (searchFlightObj?.tripType === TripType.ONEWAY_OR_MULTICITY && itinerariesLength === 1) {
      return 'oneway';
    }

    // 履歴用検索条件.旅程種別=”onewayOrMulticity”、かつリクエスト用検索条件.itinerariesの要素数=2
    if (searchFlightObj?.tripType === TripType.ONEWAY_OR_MULTICITY && itinerariesLength === 2) {
      return 'openJaw';
    }

    // 履歴用検索条件.旅程種別=”onewayOrMulticity”、かつリクエスト用検索条件.itinerariesの要素数≧3
    if (searchFlightObj?.tripType === TripType.ONEWAY_OR_MULTICITY && itinerariesLength > 2) {
      return 'multicity';
    }

    return '';
  }

  /**
   * 画面情報JSON : 往復旅程情報
   * @returns
   */
  private getRoundTripInfo(
    tripType: TripTypeInfo,
    searchFlightObj: SearchFlightState | undefined
  ): RoundTripInfo | undefined {
    if (tripType === 'roundtrip') {
      return {
        /** 往路出発日 */
        departureDate: this.formatDate(searchFlightObj?.roundTrip.departureDate),
        /** 復路出発日 */
        returnDate: this.formatDate(searchFlightObj?.roundTrip.returnDate),
        /** 出発空港コード */
        originLocationCode: searchFlightObj?.roundTrip.departureOriginLocationCode ?? '',
        /** 到着空港コード */
        destinationLocationCode: searchFlightObj?.roundTrip.departureDestinationLocationCode ?? '',
        /** 往路出発時間帯開始 */
        departureTimeWindowFrom: searchFlightObj?.roundTrip.departureTimeWindowFrom ?? undefined,
        /** 往路出発時間帯終了 */
        departureTimeWindowTo: searchFlightObj?.roundTrip.departureTimeWindowTo ?? undefined,
        /** 復路出発時間帯開始 */
        returnTimeWindowFrom: searchFlightObj?.roundTrip.returnTimeWindowFrom ?? undefined,
        /** 復路出発時間帯終了 */
        returnTimeWindowTo: searchFlightObj?.roundTrip.returnTimeWindowTo ?? undefined,
      };
    }
    return undefined;
  }

  /**
   * 画面情報JSON : 片道または複雑旅程バウンドリスト
   * @returns
   */
  private getBounds(
    tripType: TripTypeInfo,
    searchFlightObj: SearchFlightState | undefined
  ): Array<OnewayOrMulticityBound> | undefined {
    let result: Array<OnewayOrMulticityBound> = [];

    // 履歴用検索条件.旅程種別=”onewayOrMulticity”
    if (tripType === 'oneway' || tripType === 'multicity' || tripType === 'openJaw') {
      // 履歴用検索条件.複雑旅程区間数分、繰り返し
      searchFlightObj?.onewayOrMultiCity.forEach((onewayOrMulticity) => {
        const onewayOrMulticityBound: OnewayOrMulticityBound = {
          /** 出発日 */
          departureDate: this.formatDate(onewayOrMulticity.departureDate),
          /** 出発空港コード */
          originLocationCode: onewayOrMulticity.originLocationCode ?? '',
          /** 到着空港コード */
          destinationLocationCode: onewayOrMulticity.destinationLocationCode ?? '',
          /** 出発時間帯開始 */
          departureTimeWindowFrom: onewayOrMulticity.departureTimeWindowFrom ?? undefined,
          /** 出発時間帯終了 */
          departureTimeWindowTo: onewayOrMulticity.departureTimeWindowTo ?? undefined,
        };
        result.push(onewayOrMulticityBound);
      });
      return result;
    }

    return undefined;
  }

  /**
   * 画面情報JSON : 運賃情報
   * @returns
   */
  private getFareInfo(searchFlightObj: SearchFlightState | undefined, fmfFlg: boolean): FareInfo {
    if (fmfFlg) {
      return {
        /** キャビンクラス */
        cabinClass: searchFlightObj?.fare.cabinClass,
      };
    }
    if (searchFlightObj?.fare.isMixedCabin) {
      return {
        /** MixedCabin選択有無 */
        isMixedCabin: searchFlightObj.fare.isMixedCabin,
        /** MixedCabin情報 */
        mixedCabinClasses: this.getMixedCabinInfo(searchFlightObj),
      };
    }
    return {
      /** MixedCabin選択有無 */
      isMixedCabin: searchFlightObj?.fare.isMixedCabin,
      /** キャビンクラス */
      cabinClass: searchFlightObj?.fare.cabinClass,
      /** 運賃オプション */
      fareOptionType: searchFlightObj?.fare.fareOptionType,
    };
  }

  /**
   * 画面情報JSON : MixedCabin情報
   * @returns
   */
  private getMixedCabinInfo(searchFlightObj: SearchFlightState): MixedCabinInfo | undefined {
    return {
      /** 往路キャビンクラス */
      departureCabinClass: searchFlightObj.fare.cabinClass,
      /** 復路キャビンクラス */
      returnCabinClass: searchFlightObj.fare.returnCabinClass,
    };
  }

  /** yyyy-MM-dd 形式に変換 */
  private formatDate(date: Date | string | null | undefined): string {
    if (!date) {
      return '';
    }
    if (typeof date === 'string') {
      date = convertStringToDate(date);
    }
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year.toString()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  /**
   * フライト詳細ヘッダ
   * @param travelSolution
   * @returns
   */
  public createFlightDetailHeader(travelSolution: Bound): FlightDetailHeader {
    return {
      /** 閉じるボタン */
      closeButton: true,
      /** 遅延情報 */
      isContainedDelayedFlight: travelSolution.isContainedDelayedFlight,
      /** 早発情報 */
      isContainedEarlyDepartureFlight: travelSolution.isContainedEarlyDepartureFlight,
      /** 出発日 */
      originDepartureDateTime: travelSolution.originDepartureDateTime,
      /** 総所要時間 */
      duration: String(travelSolution.duration),
    };
  }

  /**
   * フライト詳細セグメント
   * @param travelSolution
   */
  public createFlightDetailSegment(travelSolution: Bound, boundIndex: number): FlightDetailSegment[] {
    let result: FlightDetailSegment[] = [];

    travelSolution.flights?.forEach(async (flight, index) => {
      let airlineNameData = this.getOperatingAirlineName(flight).split('|');
      let operatingAirlineName = airlineNameData[0];
      let operatingAirlineNameURL = '';
      if (airlineNameData.length > 1) {
        operatingAirlineNameURL = airlineNameData[1];
      }
      const flightDetailSegment: FlightDetailSegment = {
        /** 出発時刻 */
        departureDateTime: flight.departure?.dateTime,
        /** 最新出発時刻 */
        departureEstimatedDateTime: this.getDepartureEstimatedDateTime(flight),
        /** 深夜出発日時: フラグ */
        isLateNightDeparture: flight.isLateNightDeparture ?? false,
        /** 深夜出発日時: 日時 */
        nightDepartureDateTime: this.getNightDepartureDateTime(flight),
        /** 出発日 */
        departureDate: this.getDepartureDateTime(flight, index),
        /** 出発地 */
        departureAirport: this.getAirportName(flight.departure?.locationCode!, flight.departure?.locationName!),
        /** 出発ターミナル */
        departureTerminal: this.getDepartureTerminal(flight),
        /** フライト時間 */
        durationTime: String(flight.duration),
        /** 到着時刻 */
        destinationArrivalDateTime: flight.arrival?.dateTime + '',
        /** 到着日付差 */
        arrivalDaysDifferenceByFlight: String(flight.arrivalDaysDifferenceByFlight),
        /** 最新到着時刻 */
        destinationArrivalEstimatedDateTime: this.getDestinationArrivalEstimatedDateTime14(flight),
        /** 最新到着日付差 */
        estimatedArrivalDaysDifferenceByFlight: String(flight.estimatedArrivalDaysDifferenceByFlight),
        /** 到着地 */
        arrivalAirport: this.getAirportName(flight.arrival?.locationCode!, flight.arrival?.locationName!),
        /** 到着ターミナル */
        arrivalTerminal: this.getArrivalTerminal(flight),
        /** 便名 */
        marketingFlightName: this.getMarketingFlightName(flight),
        /** 運航キャリア識別 : ANAのアイコン */
        isNhGroupOperated: flight.isNhGroupOperated,
        /** 運航キャリア識別 : スターアライアンスのアイコン*/
        isStarAllianceOperated: flight.isStarAllianceOperated,
        /** 運航キャリア名称 */
        operatingAirlineName: operatingAirlineName,
        /** 運航キャリア名称URL */
        operatingAirlineNameURL: operatingAirlineNameURL,
        /** 機種コード */
        aircraftCode: flight.aircraftCode,
        /** 機種コード:URL */
        aircraftCodeURL: this.getAircraftCodeURL(flight.aircraftConfigurationVersion),
        /** ACVに設定されたキャビンクラス */
        availableCabinsText: this.getAvailableCabinsText(flight),
        /** Wi-Fiサービス */
        isWiFiServiceAll: flight.flightServices?.wiFiType === '1' ? true : false,
        /** Wi-Fiサービス(一部区間) */
        isWiFiServiceASegment: flight.flightServices?.wiFiType === '2' ? true : false,
        /** Wi-Fiサービス(利用なし) */
        isWiFiServiceNotAvailable: flight.flightServices?.wiFiType === '0' ? true : false,
        /** ACVに応じたラベルもしくは画像 */
        labelFromAcvList: this.getLabelFromAcvList14(flight),
        /** 政府認可申請中情報 */
        isSubjectToGovernmentApproval: flight.isSubjectToGovernmentApproval,
        /** 途中寄港数 */
        stopLocationCount: flight.stops?.length ?? 0,
        /** 寄港地点名称 */
        stopLocationName: this.getStopLocationName(flight),
        /** 乗継時間 */
        connectionTime: flight.connectionTime ? String(flight.connectionTime) : undefined,
        /** 乗継情報 */
        connectionInfo: this.getConnectionInfo(flight, index, travelSolution, boundIndex),
        isMultiAirportConnection: flight.isMultiAirportConnection,
      };
      result.push(flightDetailSegment);
    });

    return result;
  }

  /**
   * 運航キャリア名称
   * @param fs
   */
  private getOperatingAirlineName(flight: Type9): string {
    //キャリア取得処理
    let result = flight.operatingAirlineName ?? '';
    let _mAirline: M_AIRLINES = this._aswMasterSvc.aswMaster[MASTER_TABLE.AIRLINE_I18NJOINALL.key];
    let airlines = _mAirline[flight.operatingAirlineCode ?? ''];
    if (!airlines || airlines.length === 0) {
      // 運航キャリアコードに該当するデータが取得できないか空だった場合、運用確認ログを出力する
      this._loggerSvc.operationConfirmLog('MST0003', {
        0: MASTER_TABLE.AIRLINE_I18NJOINALL.fileName,
        1: flight.operatingAirlineCode ?? '',
      });
    }
    let operationDate = this._systemDateSvc.getSystemDate().toISOString().slice(0, 10).split('-').join('');
    for (let i = 0; i < airlines?.length; i++) {
      if (
        airlines[i].airline_code === flight.operatingAirlineCode &&
        airlines[i].apply_from_date <= operationDate &&
        operationDate <= airlines[i].apply_to_date &&
        flight.operatingAirlineCode !== this.appConstants.CARRIER.TWO_LETTER
      ) {
        if (airlines[i].operating_airline_url) {
          result = airlines[i].airline_name + '|' + airlines[i].operating_airline_url;
        } else {
          result = airlines[i].airline_name;
        }
        break;
      }
    }

    return result;
  }

  /**
   * 最新出発時刻
   * @param flight
   * @returns
   */
  private getDepartureEstimatedDateTime(flight: Type9): string {
    // 当該flight.departure.estimatedDateTimeが存在する
    if (flight.departure?.estimatedDateTime) {
      // 当該flight.departure.estimatedDateTime(yyyy-MM-dd)＝当該flight.departure.dateTime(yyyy-MM-dd)
      if (flight.departure.estimatedDateTime === flight.departure?.dateTime) {
        return flight.departure.estimatedDateTime;
      } else {
        return flight.departure.estimatedDateTime;
      }
    }

    return '';
  }

  /**
   * 深夜出発日時の取得
   * @returns 深夜出発日時
   */
  private getNightDepartureDateTime(flight: Type9): string {
    let lang = this._common.aswContextStoreService.aswContextData.lang;

    // 非ヌルアサーション「!」使用回避
    let _dateTime: string = '';
    let _estimatedDateTime: string = '';
    if (flight.departure) {
      _dateTime = flight.departure.dateTime ?? '';
      _estimatedDateTime = flight.departure.estimatedDateTime ?? '';
    }

    // 深夜出発日時	当該TS.flight[0].isLateNightDeparture=true(深夜発)であり、
    // ユーザ共通.言語情報＝”ja”(日本語)、”cn”(中国語)、”ko”(韓国語)のいずれかと一致する場合、表示
    if (flight.isLateNightDeparture) {
      if (lang === LANG_CODE.JA || lang === LANG_CODE.CN || lang === LANG_CODE.KO) {
        // 当該flight.departure.estimatedDateTimeが存在する
        if (flight.departure?.estimatedDateTime !== undefined && flight.departure?.estimatedDateTime !== '') {
          return this._dateFormatPipe.transform(_estimatedDateTime, 'default_departuredate.midnightTime', true);
        } else {
          return this._dateFormatPipe.transform(_dateTime, 'default_departuredate.midnightTime', true);
        }
      }
    }

    return '';
  }

  /**
   * 出発日
   * @param flight
   * @returns
   */
  private getDepartureDateTime(flight: Type9, ffIndex: number): string {
    // 当該flightのインデックス>0、かつ
    // 当該flight.departureDaysDifferenceByBound≠0
    if (ffIndex > 0 && flight.departureDaysDifferenceByBound !== 0) {
      return flight.departure?.dateTime ?? '';
    }
    return '';
  }

  /**
   * ASWDB(マスタ)の空港テーブルから空港名の取得
   * @param airportCode 空港コード
   * @returns 空港名
   */
  private getAirportName(airportCode: string, airportName: string): string {
    let updateResult = '';
    // フライト詳細で空港コードのみのため、JoinByAirportCodeCache
    let _airPorts: AirportI18nJoinByAirportCodeCache =
      this._aswMasterSvc.aswMaster[MASTER_TABLE.AIRPORT_I18N_JOIN_BY_AIRPORT_CODE.key];
    let airPorts = _airPorts[airportCode];
    if (!airPorts || airPorts.length === 0) {
      // 空港コードに該当するデータが取得できないか空だった場合、運用確認ログを出力する
      this._loggerSvc.operationConfirmLog('MST0003', {
        0: MASTER_TABLE.AIRPORT_I18N_JOIN_BY_AIRPORT_CODE.fileName,
        1: airportCode,
      });
    }
    for (let i = 0; i < airPorts?.length; i++) {
      if (airPorts[i].airport_code === airportCode) {
        updateResult = airPorts[i].airport_name;
        break;
      }
    }
    if (updateResult) {
      return updateResult;
    }
    return airportName;
  }

  /**
   * 出発ターミナルの取得
   * @returns
   */
  private getDepartureTerminal(flight: Type9): string {
    // 当該flight.departure.terminalが存在する
    // 当該flight.departure.terminalを含む文言
    let result = flight.departure?.terminal ?? '';

    // 1	当該flight.departure.terminalが存在しない
    // 2	当該flight.departure.locationCode=”HND”
    // 3	当該flight.isNhGroupOperated=true(NHグループ運航便)
    if (result === '' && flight.departure?.locationCode === 'HND' && flight.isNhGroupOperated) {
      // 未確定文言が不明
      return 'pending';
    }

    return result;
  }

  /**
   * 最新到着時刻
   * @param 7flight
   * @returns
   */
  private getDestinationArrivalEstimatedDateTime14(flight: Type9): string {
    // 当該flight.arrival.estimatedDateTimeが存在する
    if (flight.arrival?.estimatedDateTime) {
      if (flight.arrival.estimatedDateTime === flight.arrival.dateTime) {
        return flight.arrival.estimatedDateTime;
      } else {
        return flight.arrival.estimatedDateTime;
      }
    }
    return '';
  }

  /**
   * 到着ターミナルの取得
   * @param flight
   * @returns
   */
  private getArrivalTerminal(flight: Type9): string {
    // 当該flight.arrival.terminalが存在する
    // 当該flight.arrival.terminalを含む文言
    let result = flight.arrival?.terminal ?? '';

    // 1	当該flight.arrival.terminalが存在しない
    // 2	当該flight.arrival.locationCode=”HND”
    // 3	当該flight.isNhGroupOperated=true(NHグループ運航便)
    if (result === '' && flight.arrival?.locationCode === 'HND' && flight.isNhGroupOperated) {
      // 未確定文言が不明
      return 'pending';
    }

    return result;
  }

  /**
   * 便名
   * @param flight
   * @returns
   */
  private getMarketingFlightName(flight: Type9): string {
    let result = '';
    if (flight.marketingAirlineCode) {
      result = flight.marketingAirlineCode;
    }
    if (flight.marketingFlightNumber) {
      result = result + flight.marketingFlightNumber;
    }

    return result;
  }

  /**
   * 機種コードのURL取得
   * @returns 取得したURL
   */
  private getAircraftCodeURL(aircraftConfigurationVersion: string | undefined): string {
    if (aircraftConfigurationVersion === undefined) {
      return '';
    }
    // 当該flight.aircraftCode=ACVとなるASWDB(マスタ)の機材.機種URLが存在する
    // 当該flight.aircraftCode(当該flight.aircraftCode=ACVとなるASWDB(マスタ)の機材.機種URLをリンク表示)
    // ※ユーザ共通.端末識別＝”SP”の場合、当該flight.aircraftNameを読み上げラベルとして追加する。
    let result = '';
    let _mEquipments: M_EQUIPMENTS = this._aswMasterSvc.aswMaster[MASTER_TABLE.EQUIPMENT_I18NJOIN_PK.key];
    if (_mEquipments) {
      let equipment = _mEquipments[aircraftConfigurationVersion];
      if (equipment) {
        equipment.forEach((mEquipment: M_EQUIPMENT) => {
          if (mEquipment.acv === aircraftConfigurationVersion) {
            result = mEquipment.aircraft_type_url;
          }
        });
      }
    }
    return result;
  }

  /**
   *
   * @param flight
   * @returns
   */
  private getAvailableCabinsText(flight: Type9): string {
    // 以下の処理にて作成した文字列を表示する。
    // キャビンクラスリストとして空のリストを作成する。
    let cabinClassList: string[] = [];

    let flightType = '';
    // 当該flight.isJapanDomesticFlight=trueの場合は”domestic”、そうでない場合は”international”
    if (flight.isJapanDomesticFlight) {
      flightType = 'domestic';
    } else {
      flightType = 'international';
    }

    let pD930Cache: [CabinCache] = this.getPD930Content(flightType);

    let availableCabinsList = pD930Cache.filter((element) => flight.availableCabins?.includes(element.value));

    cabinClassList = availableCabinsList.map((obj) => obj.label);

    // キャビンクラスリストを区切り文字で連結したものを表示する。
    const separator = this._staticMsgPipe.transform('label.separaterComma');
    return cabinClassList.join(separator);
  }

  /**
   * PD_930キャッシュの取得
   * @param value
   * @returns
   */
  private getPD930Content(type: string): [CabinCache] {
    let m_list_data_930: CabinCacheList = this._aswMasterSvc.aswMaster[MASTER_TABLE.M_LIST_DATA_930.key];
    let typeDataList = m_list_data_930?.[type];
    return typeDataList;
  }

  /**
   * ACVに応じたラベルもしくは画像の取得
   * @returns
   */
  private getLabelFromAcvList14(flight: Type9): AcvItem {
    let iscontain: boolean = false;
    let result: AcvItem = {
      type: '',
      img: '',
      tooltipText: '',
      original: '',
    };
    let _mAircraftCabin: M_AIRCRAFT_CABIN_MAPS =
      this._aswMasterSvc.aswMaster[MASTER_TABLE.AIRCRAFTCABIN_I18NJOIN_BYPK.key];
    const cabinClass = this._searchFlightConditionForRequestService.getData().request.fare.cabinClass;
    if (this._common.aswContextStoreService.aswContextData.posCountryCode === 'MX') {
      this.couchAcvCodeList.forEach((couchAcvCode) => {
        if (flight.aircraftConfigurationVersion && couchAcvCode.includes(flight.aircraftConfigurationVersion)) {
          iscontain = true;
        }
      });
    }
    let acvLabels =
      !!_mAircraftCabin[flight.aircraftConfigurationVersion ?? ''] &&
      !!_mAircraftCabin[flight.aircraftConfigurationVersion ?? ''][cabinClass ?? '']
        ? _mAircraftCabin[flight.aircraftConfigurationVersion ?? ''][cabinClass ?? '']
        : undefined;
    if (!iscontain && acvLabels) {
      acvLabels.forEach((mAircraftCabin: M_AIRCRAFT_CABIN) => {
        if (mAircraftCabin.acv === flight.aircraftConfigurationVersion && mAircraftCabin.cabin === cabinClass) {
          const acvKey = mAircraftCabin.acv_characteristic_message_key;
          result = this.convertToAcvItem(acvKey);
        }
      });
    } else if (!iscontain && flight.aircraftConfigurationVersion && cabinClass) {
      if (this._dcsDateService.isAfterDcs(flight.departure?.dateTime ?? '') || !flight.isJapanDomesticFlight) {
        // ACVに該当するデータが取得できないか空だった場合、運用確認ログを出力する
        this._loggerSvc.operationConfirmLog('MST0003', {
          0: MASTER_TABLE.AIRCRAFTCABIN_I18NJOIN_BYPK.fileName,
          1: flight.aircraftConfigurationVersion,
        });
      }
    }
    return result;
  }

  /**
   * 寄港地点名称
   * @param flight
   * @returns
   */
  private getStopLocationName(flight: Type9): string {
    const separator = this._staticMsgPipe.transform('label.separaterComma');

    // 当該flight.stopsが1件以上	当該flight.stopsの要素(以降、寄港地点情報)数分、繰り返し表示
    //   当該寄港地点情報.locationCode=空港コードとなるASWDB(マスタ)の空港のレコードが存在する
    //   当該寄港地点情報.locationCode=空港コードとなるASWDB(マスタ)の空港.空港名称
    // 上記以外	当該寄港地点情報.locationName
    let result = flight.stops
      ?.map((stop_v) => {
        return this.getAirportName(stop_v.locationCode!, stop_v.locationName!);
      })
      .join(separator);
    return result ?? '';
  }

  /**
   * 乗継情報
   * @param flight
   * @param ffIndex
   * @param travelSolution
   * @param boundIndex
   * @returns
   */
  private getConnectionInfo(flight: Type9, ffIndex: number, travelSolution: Bound, boundIndex: number): string {
    // 当該flightのインデックス≠当該バウンド.flightsの件数-1の場合のみ表示する。
    if (travelSolution.flights && ffIndex !== travelSolution.flights.length - 1) {
      // 以下、当該flight.arrival.locationCode=当該バウンド.flights[当該flightのインデックス+1].departure.locationCodeかどうかを、
      //  乗継空港一致とし、乗継空港一致=trueの場合は背景色青色、そうでない場合は背景色オレンジ色にて表示する。
      if (travelSolution.flights![ffIndex + 1] !== undefined) {
        if (flight.arrival?.locationCode === travelSolution.flights![ffIndex + 1]!.departure?.locationCode) {
          // 以下を含む乗継である旨の文言
          // 当該flight.arrival.locationCode=空港コードとなるASWDB(マスタ)の空港が取得できた場合、当該flight.arrival.locationCode用空港コードとなるASWDB(マスタ)の空港.空港名称
          // 上記以外の場合、当該flight.arrival.locationName
          return this.getAirportName(flight.arrival?.locationCode!, flight.arrival?.locationName!);
        } else {
          // 別空港への移動を伴う乗り継ぎである旨の文言
          return 'label.interAirportTransit';
        }
      }
    }
    return '';
  }

  /** カート作成処理 */
  public async createCart(createCartRequest: CreateCartRequest) {
    this._pageLoadingService.startLoading();

    // カート作成APIの実行
    this._createCartStoreService.setCreateCartFromApi(createCartRequest);

    // カート作成API実行後処理
    this.subscribeService(
      'createCartStoreServiceApiCall',
      this._createCartStoreService.getCreateCart$(),
      (response) => {
        if (response.isPending === false) {
          this._pageLoadingService.endLoading();
          if (response.isFailure) {
            // カート作成レスポンス.errors[0].code=”EBAZ000422”、かつ検索結果旅程種別=“domestic”以外の場合、エラーメッセージID＝”E0331”(AirOfferの第1セグメント出発地の現地日付で出発時刻の6時間以内)にて継続可能なエラー情報を指定し、次へボタン押下時処理を終了する。
            const isDomesticTrip = this._R01P030Store.searchResultItineraryType === 'domestic';
            if (
              this._common.apiError?.['errors']?.[0].code === ErrorCodeConstants.ERROR_CODES.EBAZ000422 &&
              !isDomesticTrip
            ) {
              const pageType: PageType = PageType.PAGE;
              const errorInfo: RetryableError = {
                errorMsgId: 'E0331',
                apiErrorCode: ErrorCodeConstants.ERROR_CODES.EBAZ000422,
              };
              this._errorsHandlerSvc.setRetryableError(pageType, errorInfo);
            } else if (this._common.apiError?.['errors']?.[0].code === ErrorCodeConstants.ERROR_CODES.EBAZ000627) {
              // カート作成レスポンス.errors[0].code=”EBAZ000627”の場合、
              // エラーメッセージID＝”E0924”(日本国内単独旅程かつ第一セグメントの出発予定時刻が出発予定時刻まで20分前を切っている)にて継続可能なエラー情報を指定し、
              // 次へボタン押下時処理を終了する。
              const pageType: PageType = PageType.PAGE;
              const errorInfo: RetryableError = {
                errorMsgId: 'E0924',
                apiErrorCode: ErrorCodeConstants.ERROR_CODES.EBAZ000627,
              };
              this._errorsHandlerSvc.setRetryableError(pageType, errorInfo);
            } else if (this._common.apiError?.['errors']?.[0].code === ErrorCodeConstants.ERROR_CODES.EBAZ000628) {
              // カート作成レスポンス.errors[0].code=”EBAZ000628”の場合、
              // エラーメッセージID＝”E0925”(Peach運航便(コードシェア便)を含む日本国内単独旅程かつセグメント内のPeach運航便(コードシェア便)の出発予定時刻が出発予定時刻まで3時間前を切っている)にて継続可能なエラー情報を指定し、
              // 次へボタン押下時処理を終了する。
              const pageType: PageType = PageType.PAGE;
              const errorInfo: RetryableError = {
                errorMsgId: 'E0925',
                apiErrorCode: ErrorCodeConstants.ERROR_CODES.EBAZ000628,
              };
              this._errorsHandlerSvc.setRetryableError(pageType, errorInfo);
            } else if (this._common.apiError?.['errors']?.[0].code === ErrorCodeConstants.ERROR_CODES.EBAZ000841) {
              // airoffer更新レスポンス.errors[0].code=”EBAZ000841”の場合、
              // 継続不可能エラータイプ="BUSINESS_LOGIC"、エラーメッセージID="E1843"(AirOfferが有効期限切れ)にて継続不可能なエラー情報を指定し、
              // 共通エラー画面に遷移する。
              const errorInfo: NotRetryableErrorModel = {
                errorType: ErrorType.BUSINESS_LOGIC,
                apiErrorCode: this._common.apiError?.['errors']?.[0].code,
                errorMsgId: 'E1843',
              };
              this._errorsHandlerSvc.setNotRetryableError(errorInfo);
            } else {
              const errorInfo: NotRetryableErrorModel = {
                errorType: ErrorType.SYSTEM,
                apiErrorCode: this._common.apiError?.['errors']?.[0].code,
              };
              this._errorsHandlerSvc.setNotRetryableError(errorInfo);
            }
          } else {
            // 以下、カート作成API処理が正常に行われたときの処理
            // プラン確認画面(R01-P040)受け渡し情報.操作中カート情報.dataに、カート作成API.レスポンス.dataを設定する
            this._currentCartStoreService.updateCurrentCart({
              data: response.data,
            });
            // 画面遷移処理
            this._router.navigateByUrl(RoutesResRoutes.PLAN_REVIEW);
          }
        }
      }
    );
  }

  /** カートのAirOffer更新処理 */
  public updateAirOffers(param: PatchUpdateAirOffersRequest) {
    this._cancelPrebookService.cancelPrebookNext(
      () => {
        this._pageLoadingService.startLoading();
        // airoffer更新API実行
        apiEventAll(
          () => {
            this._updateAirOffersStoreService.setUpdateAirOffersFromApi(param);
          },
          this._updateAirOffersStoreService.getUpdateAirOffers$(),
          (response) => {
            if (response.isPending === false) {
              this._pageLoadingService.endLoading();
              // 以下、airofferAPI処理が正常に行われたときの処理
              // warningが存在する場合の処理
              if (response.warnings) {
                response.warnings.forEach((v) => {
                  if (
                    v.code === ErrorCodeConstants.ERROR_CODES.WBAZ000426 ||
                    v.code === ErrorCodeConstants.ERROR_CODES.WBAZ000430
                  ) {
                    this._deliveryInfoStoreService.setDeliveryInformation({
                      ...this._deliveryInfoStoreService.deliveryInformationData,
                      planReviewInformation: {
                        ...this._deliveryInfoStoreService.deliveryInformationData.planReviewInformation,
                        supportRegisterErrorCode: v.code,
                      },
                    });
                  }
                });
              }
              // プラン確認画面(R01-P040)受け渡し情報.操作中カート情報.dataに、カート作成API.レスポンス.dataを設定する
              this._currentCartStoreService.updateCurrentCart({
                data: response.data,
              });
              // 画面遷移処理
              this._router.navigateByUrl(RoutesResRoutes.PLAN_REVIEW);
            }
          },
          (err) => {
            if (err.isPending === false) {
              this._pageLoadingService.endLoading();
              if (err.isFailure) {
                // airoffer更新レスポンス.errors[0].code=”EBAZ000422”、かつ検索結果旅程種別=“domestic”以外の場合、エラーメッセージID＝”E0331”(AirOfferの第1セグメント出発地の現地日付で出発時刻の6時間以内)にて継続可能なエラー情報を指定し、次へボタン押下時処理を終了する。
                const isDomesticTrip = this._R01P030Store.searchResultItineraryType === 'domestic';
                if (
                  this._common.apiError?.['errors']?.[0].code === ErrorCodeConstants.ERROR_CODES.EBAZ000422 &&
                  !isDomesticTrip
                ) {
                  const pageType: PageType = PageType.PAGE;
                  const errorInfo: RetryableError = {
                    errorMsgId: 'E0331',
                    apiErrorCode: ErrorCodeConstants.ERROR_CODES.EBAZ000422,
                  };
                  this._errorsHandlerSvc.setRetryableError(pageType, errorInfo);
                } else if (this._common.apiError?.['errors']?.[0].code === ErrorCodeConstants.ERROR_CODES.EBAZ000627) {
                  // airoffer更新レスポンス.errors[0].code=”EBAZ000627”の場合、
                  // エラーメッセージID＝”E0924”(日本国内単独旅程かつ第一セグメントの出発予定時刻が出発予定時刻まで20分前を切っている)にて継続可能なエラー情報を指定し、
                  // 次へボタン押下時処理を終了する。
                  const pageType: PageType = PageType.PAGE;
                  const errorInfo: RetryableError = {
                    errorMsgId: 'E0924',
                    apiErrorCode: ErrorCodeConstants.ERROR_CODES.EBAZ000627,
                  };
                  this._errorsHandlerSvc.setRetryableError(pageType, errorInfo);
                } else if (this._common.apiError?.['errors']?.[0].code === ErrorCodeConstants.ERROR_CODES.EBAZ000628) {
                  // airoffer更新レスポンス.errors[0].code=”EBAZ000628”の場合、
                  // エラーメッセージID＝”E0925”(Peach運航便(コードシェア便)を含む日本国内単独旅程かつセグメント内のPeach運航便(コードシェア便)の出発予定時刻が出発予定時刻まで3時間前を切っている)にて継続可能なエラー情報を指定し、
                  // 次へボタン押下時処理を終了する。
                  const pageType: PageType = PageType.PAGE;
                  const errorInfo: RetryableError = {
                    errorMsgId: 'E0925',
                    apiErrorCode: ErrorCodeConstants.ERROR_CODES.EBAZ000628,
                  };
                  this._errorsHandlerSvc.setRetryableError(pageType, errorInfo);
                } else if (this._common.apiError?.['errors']?.[0].code === ErrorCodeConstants.ERROR_CODES.EBAZ000841) {
                  // airoffer更新レスポンス.errors[0].code="EBAZ000841"の場合、
                  // 継続不可能エラータイプ="BUSINESS_LOGIC"、エラーメッセージID="E1843"(AirOfferが有効期限切れ)にて継続不可能なエラー情報を指定し、
                  // 共通エラー画面に遷移する。
                  const errorInfo: NotRetryableErrorModel = {
                    errorType: ErrorType.BUSINESS_LOGIC,
                    apiErrorCode: this._common.apiError?.['errors']?.[0].code,
                    errorMsgId: 'E1843',
                  };
                  this._errorsHandlerSvc.setNotRetryableError(errorInfo);
                } else {
                  const errorInfo: NotRetryableErrorModel = {
                    errorType: ErrorType.SYSTEM,
                    apiErrorCode: this._common.apiError?.['errors']?.[0].code,
                  };
                  this._errorsHandlerSvc.setNotRetryableError(errorInfo);
                }
              }
            }
          }
        );
      },
      () => {
        // cancelPrebookNext 失敗したとき、処理をしない。
      }
    );
  }

  /**
   * お気に入り追加ボタン押下時処理 ※検索結果操作部
   */
  public addFavorite(searchFlight: SearchFlightStateDetails | undefined, pageId: string) {
    // 以下の項目を基に、お気に入り登録APIを呼び出す。
    let boundList: Array<HistoryPostRequestHistoryBoundsInner> = [];
    searchFlight?.onewayOrMultiCity.forEach((onewayOrMulticity) => {
      const bound: HistoryPostRequestHistoryBoundsInner = {
        /** 出発空港コード */
        originLocationCode: onewayOrMulticity.originLocationCode + '',
        /** 到着空港コード */
        destinationLocationCode: onewayOrMulticity.destinationLocationCode + '',
        /** 往路出発日 */
        departureDate: onewayOrMulticity.departureDate ? this.convertDate(onewayOrMulticity.departureDate) : '',
        /** 出発開始時刻(HH:mm:ss) */
        departureTimeWindowFrom:
          onewayOrMulticity.departureTimeWindowFrom !== 0 || onewayOrMulticity.departureTimeWindowTo !== 1439
            ? this.formatDepartureTimeForAPI(onewayOrMulticity.departureTimeWindowFrom)
            : undefined,
        /** 出発終了時刻(HH:mm:ss) */
        departureTimeWindowTo:
          onewayOrMulticity.departureTimeWindowFrom !== 0 || onewayOrMulticity.departureTimeWindowTo !== 1439
            ? this.formatDepartureTimeForAPI(onewayOrMulticity.departureTimeWindowTo)
            : undefined,
      };
      boundList.push(bound);
    });

    let hasAccompaniedInAnotherReservation: boolean | undefined = undefined;

    if (
      searchFlight?.hasAccompaniedInAnotherReservation ||
      searchFlight?.hasAccompaniedInAnotherReservation === false
    ) {
      hasAccompaniedInAnotherReservation = searchFlight.hasAccompaniedInAnotherReservation;
    }

    const isMixedCabin = searchFlight?.fare?.isMixedCabin;
    let mixedCabinClasses: Type8MixedCabinClasses | undefined;
    if (isMixedCabin) {
      mixedCabinClasses = {
        departureCabinClass: searchFlight?.fare.cabinClass,
        returnCabinClass: searchFlight?.fare.returnCabinClass,
      };
    } else {
      mixedCabinClasses = undefined;
    }

    const favoritePostRequest: FavoritePostRequest = {
      favorite: {
        tripType: searchFlight?.tripType === TripType.ROUND_TRIP ? 'roundtrip' : 'onewayOrMulticity',
        roundtrip:
          searchFlight?.tripType === TripType.ROUND_TRIP
            ? {
                originLocationCode: searchFlight?.roundTrip?.departureOriginLocationCode ?? '',
                destinationLocationCode: searchFlight?.roundTrip?.departureDestinationLocationCode ?? '',
                departureDate: searchFlight?.roundTrip?.departureDate
                  ? this.convertDate(searchFlight.roundTrip.departureDate)
                  : '',
                departureTimeWindowFrom:
                  searchFlight?.roundTrip?.departureTimeWindowFrom !== 0 ||
                  searchFlight?.roundTrip?.departureTimeWindowTo !== 1439
                    ? this.formatDepartureTimeForAPI(searchFlight?.roundTrip?.departureTimeWindowFrom ?? null)
                    : undefined,
                departureTimeWindowTo:
                  searchFlight?.roundTrip?.departureTimeWindowFrom !== 0 ||
                  searchFlight?.roundTrip?.departureTimeWindowTo !== 1439
                    ? this.formatDepartureTimeForAPI(searchFlight?.roundTrip?.departureTimeWindowTo ?? null)
                    : undefined,
                returnDate: searchFlight?.roundTrip?.returnDate
                  ? this.convertDate(searchFlight.roundTrip.returnDate)
                  : '',
                returnTimeWindowFrom:
                  searchFlight?.roundTrip?.returnTimeWindowFrom !== 0 ||
                  searchFlight?.roundTrip?.returnTimeWindowTo !== 1439
                    ? this.formatDepartureTimeForAPI(searchFlight?.roundTrip?.returnTimeWindowFrom ?? null)
                    : undefined,
                returnTimeWindowTo:
                  searchFlight?.roundTrip?.returnTimeWindowFrom !== 0 ||
                  searchFlight?.roundTrip?.returnTimeWindowTo !== 1439
                    ? this.formatDepartureTimeForAPI(searchFlight?.roundTrip?.returnTimeWindowTo ?? null)
                    : undefined,
                departureConnectionLocationCode:
                  searchFlight?.roundTrip?.departureConnection.connectionLocationCode === null
                    ? undefined
                    : searchFlight?.roundTrip?.departureConnection.connectionLocationCode,
                departureConnectionTime: searchFlight?.roundTrip?.departureConnection.connectionTime ?? undefined,
                returnConnectionLocationCode:
                  searchFlight?.roundTrip?.returnConnection.connectionLocationCode === null
                    ? undefined
                    : searchFlight?.roundTrip?.returnConnection.connectionLocationCode,
                returnConnectionTime: searchFlight?.roundTrip?.returnConnection.connectionTime ?? undefined,
              }
            : undefined,
        // 履歴用検索条件.往復旅程区間が存在しない場合、履歴用検索条件.複雑旅程区間を基に数分、設定する。
        bounds: searchFlight?.tripType !== TripType.ROUND_TRIP ? boundList : undefined,
        fare: {
          isMixedCabin: isMixedCabin,
          cabinClass: isMixedCabin === false ? searchFlight?.fare?.cabinClass : undefined,
          fareOptionType: isMixedCabin === false ? searchFlight?.fare?.fareOptionType : undefined,
          mixedCabinClasses: mixedCabinClasses,
        },
        travelers: {
          ADT: searchFlight?.traveler.adt ?? 0,
          B15: searchFlight?.traveler.b15 ?? 0,
          CHD: searchFlight?.traveler.chd ?? 0,
          INF: searchFlight?.traveler.inf ?? 0,
        },
        promotionCode: searchFlight?.promotion.code,
        hasAccompaniedInAnotherReservation: hasAccompaniedInAnotherReservation,
      },
      commonIgnoreErrorFlg: true,
    };
    // お気に入り追加API実行
    this._favoritePostService.setFavoritePostFromApi(favoritePostRequest);
    this._common.apiErrorResponseService.clearApiErrorResponse();
    this.subscribeService('FavoritePostService', this._favoritePostService.getFavoritePost(), (response) => {
      if (response.isPending === false) {
        // エラーが発生したお気に入り登録レスポンスが通知された場合、
        // 継続不可能エラータイプ＝”system”(システムエラー)にて継続不可能なエラー情報を指定し、お気に入り追加ボタン押下時処理を終了する。
        const errorCode = this._common.apiError?.errors?.[0].code;
        if (errorCode) {
          if (errorCode === ErrorCodeConstants.ERROR_CODES.EBAZ000437) {
            this._common.errorsHandlerService.setRetryableError(PageType.PAGE, {
              apiErrorCode: errorCode,
              errorMsgId: 'E0241',
            });
            return;
          } else if (errorCode !== ErrorCodeConstants.ERROR_CODES.EBAZ000437) {
            this._common.errorsHandlerService.setNotRetryableError({
              errorType: ErrorType.SYSTEM,
              apiErrorCode: errorCode,
            });
            return;
          }
        }

        if (pageId === 'P030') {
          // エラーが発生していないお気に入り登録レスポンスが通知された場合、往復空席照会画面用ストアのお気に入り登録済みに、trueを設定する。
          // ※当処理はstoreを介して行う。
          // ※お気に入り登録レスポンス.warningsが存在する場合も、正常に登録完了したと見なして無視する。
          const changeAreaDisplayStatus: RoundtripFlightAvailabilityInternationalState = {
            /** お気に入り登録済み */
            isRegisteredFavorite: true,
          };

          // ※当画面の各エリアの表示状態をstoreで管理
          this._roundtripFlightAvailabilityInternationalService.updateRoundtripFlightAvailabilityInternational(
            changeAreaDisplayStatus
          );
        } else if (pageId === 'P032') {
          // エラーが発生していないお気に入り登録レスポンスが通知された場合、複雑カレンダー画面用ストアのお気に入り登録済みに、trueを設定する。
          let favoriteFlag = true;
          let isNotFavoriteAnimation = true;

          // 当処理はstoreを介して行う
          this._complexFlightCalendarStoreService.updateComplexFlightCalendar({
            favoriteFlag,
            isNotFavoriteAnimation,
          });
        } else if (pageId === 'P033') {
          // エラーが発生していないお気に入り登録レスポンスが通知された場合、複雑空席照会画面用ストアのお気に入り登録済みに、trueを設定する。
          let favoriteFlag = true;
          let isNotFavoriteAnimation = true;

          // 当処理はstoreを介して行う
          this._complexFlightAvailabilityStoreService.updateFavoriteState(favoriteFlag, isNotFavoriteAnimation);
        }
      }
    });
  }

  /** HH:mm:ss形式に変換する　設定値がない場合undefinedを返す */
  private formatDepartureTimeForAPI(value: number | null) {
    if ((value || value === 0) && value !== null) {
      return new Date(value * 60 * 1000).toISOString().substring(11, 19);
    }
    return undefined;
  }

  // 履歴登録リクエストを設置し、APIを呼び出す。
  public async historyRegister(searchFlight: SearchFlightStateDetails | undefined) {
    let historyPostRequestHistory: HistoryPostRequestHistory;
    const promotionCode = searchFlight?.promotion.code;
    const tripType = searchFlight?.tripType;
    const isMixedCabin = searchFlight?.fare.isMixedCabin;
    let mixedCabinClasses: Type8MixedCabinClasses | undefined;
    if (isMixedCabin) {
      mixedCabinClasses = {
        departureCabinClass: searchFlight?.fare.cabinClass,
        returnCabinClass: searchFlight?.fare.returnCabinClass,
      };
    } else {
      mixedCabinClasses = undefined;
    }
    const fare: Type8 = {
      isMixedCabin: isMixedCabin,
      cabinClass: isMixedCabin === false ? searchFlight?.fare.cabinClass : undefined,
      fareOptionType: isMixedCabin === false ? searchFlight?.fare.fareOptionType : undefined,
      mixedCabinClasses: mixedCabinClasses,
    };

    let roundtrip: HistoryPostRequestHistoryRoundtrip = {
      originLocationCode: '',
      destinationLocationCode: '',
      departureDate: '',
      returnDate: '',
    };
    roundtrip = {
      originLocationCode: searchFlight?.roundTrip.departureOriginLocationCode ?? '',
      // 到着空港コード
      destinationLocationCode: searchFlight?.roundTrip?.departureDestinationLocationCode ?? '',
      // 往路出発日(yyyy-MM-dd)
      departureDate: searchFlight?.roundTrip?.departureDate
        ? this.convertDate(searchFlight.roundTrip.departureDate)
        : '',
      // 往路出発開始時間(HH:mm:ss)
      departureTimeWindowFrom:
        searchFlight?.roundTrip?.departureTimeWindowFrom !== 0 ||
        searchFlight?.roundTrip?.departureTimeWindowTo !== 1439
          ? this.convertNumberToTimeString(searchFlight?.roundTrip?.departureTimeWindowFrom ?? 0)
          : undefined,
      // 往路出発終了時刻(HH:mm:ss)
      departureTimeWindowTo:
        searchFlight?.roundTrip?.departureTimeWindowFrom !== 0 ||
        searchFlight?.roundTrip?.departureTimeWindowTo !== 1439
          ? this.convertNumberToTimeString(searchFlight?.roundTrip?.departureTimeWindowTo ?? 1439)
          : undefined,
      // 復路出発日(yyyy-MM-dd)
      returnDate: searchFlight?.roundTrip?.returnDate ? this.convertDate(searchFlight.roundTrip.returnDate) : '',
      // 復路出発開始時刻(HH:mm:ss)
      returnTimeWindowFrom:
        searchFlight?.roundTrip?.returnTimeWindowFrom !== 0 || searchFlight?.roundTrip?.returnTimeWindowTo !== 1439
          ? this.convertNumberToTimeString(searchFlight?.roundTrip?.returnTimeWindowFrom ?? 0)
          : undefined,
      // 復路出発終了時刻(HH:mm:ss)
      returnTimeWindowTo:
        searchFlight?.roundTrip?.returnTimeWindowFrom !== 0 || searchFlight?.roundTrip?.returnTimeWindowTo !== 1439
          ? this.convertNumberToTimeString(searchFlight?.roundTrip?.returnTimeWindowTo ?? 0)
          : undefined,
      //  往路乗り継ぎ地点
      departureConnectionLocationCode:
        searchFlight?.roundTrip?.departureConnection?.connectionLocationCode ?? undefined,
      // 往路乗り継ぎ時間(分単位)
      departureConnectionTime: searchFlight?.roundTrip?.departureConnection?.connectionTime ?? undefined,
      // 復路乗り継ぎ地点
      returnConnectionLocationCode: searchFlight?.roundTrip?.returnConnection?.connectionLocationCode ?? undefined,
      // 復路乗り継ぎ時間(分単位)
      returnConnectionTime: searchFlight?.roundTrip?.returnConnection?.connectionTime ?? undefined,
    };

    let bounds: Array<HistoryPostRequestHistoryBoundsInner> = [];

    bounds =
      searchFlight?.onewayOrMultiCity.map((bound) => {
        const historyPostRequestHistoryBoundsInner: HistoryPostRequestHistoryBoundsInner = {
          originLocationCode: bound.originLocationCode ?? '',
          destinationLocationCode: bound.destinationLocationCode ?? '',
          departureDate: bound.departureDate ? this.convertDate(bound.departureDate) : '',
          departureTimeWindowFrom:
            bound.departureTimeWindowFrom !== 0 || bound.departureTimeWindowTo !== 1439
              ? this.convertNumberToTimeString(bound.departureTimeWindowFrom ?? 0)
              : undefined,
          departureTimeWindowTo:
            bound.departureTimeWindowFrom !== 0 || bound.departureTimeWindowTo !== 1439
              ? this.convertNumberToTimeString(bound.departureTimeWindowTo ?? 1439)
              : undefined,
        };
        return historyPostRequestHistoryBoundsInner;
      }) ?? [];

    const travelers: NumberOfTravelers = {
      ADT: searchFlight?.traveler?.adt ?? 0,
      B15: searchFlight?.traveler?.b15 ?? 0,
      CHD: searchFlight?.traveler?.chd ?? 0,
      INF: searchFlight?.traveler?.inf ?? 0,
    };

    let hasAccompaniedInAnotherReservation: boolean | undefined = undefined;

    if (
      searchFlight?.hasAccompaniedInAnotherReservation ||
      searchFlight?.hasAccompaniedInAnotherReservation === false
    ) {
      hasAccompaniedInAnotherReservation = searchFlight.hasAccompaniedInAnotherReservation;
    }

    historyPostRequestHistory = {
      promotionCode: promotionCode,
      tripType: tripType === 0 ? 'roundtrip' : 'onewayOrMulticity',
      fare: fare,
      roundtrip: tripType === 0 ? roundtrip : undefined,
      bounds: tripType !== 0 ? bounds : undefined,
      travelers: travelers,
      hasAccompaniedInAnotherReservation: hasAccompaniedInAnotherReservation,
    };

    // 呼び出し時、エラーハンドリング回避フラグ(commonIgnoreErrorFlg)としてtureを指定する。
    const historyPostRequest: HistoryPostRequest & { commonIgnoreErrorFlg: boolean } = {
      commonIgnoreErrorFlg: true,
      history: historyPostRequestHistory,
    };

    await new Promise<void>((resolve) => {
      this.subscribeService(
        'RoundtripFlightAvailabilityInternationalCall',
        this._searchApiService.historyPost(historyPostRequest, 'response'),
        (response) => {
          resolve();
        },
        (err) => {
          // エラーが発生した履歴登録レスポンスが通知された場合、エラーログの出力を行う。
          // ※当処理はstoreを介して行う。エラーが発生した場合でも画面を継続させるため、非同期で通知されたエラーを無視する。
          console.log('履歴登録レスポンスで無視エラー発生（履歴登録処理時）');
          resolve();
        }
      );
    });
  }

  /**
   * Date型をyyyy-mm-ddに変換する
   * @returns
   */
  private convertDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year.toString()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  /** 数値型をHH:mm:ss形式に変換する */
  private convertNumberToTimeString(value: number) {
    return new Date(value * 60 * 1000).toISOString().substring(11, 19);
  }

  /**
   * 静的文言の中に埋め込まれたtooltipを解析
   */
  public convertToAcvItem(acvkey: string): AcvItem {
    if (!acvkey) {
      return {
        type: '',
        img: '',
        tooltipText: '',
        original: acvkey,
      };
    }
    // 静的文言メッセージを取得
    const acvStaticMsg = this._staticMsgPipe.transform(acvkey);
    // tooltipが含まれているかどうかを判断する
    if (acvStaticMsg.includes('tooltip')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(acvStaticMsg, 'text/html');
      const imgElement = doc.querySelector('img');
      const imgAttr = [
        `src="${imgElement?.getAttribute('src')}"`,
        `width="${imgElement?.getAttribute('width')}"`,
        `height="${imgElement?.getAttribute('height')}"`,
        `alt="${imgElement?.getAttribute('alt')}"`,
      ].join(' ');

      // 画像のHTML文
      const img = `<img ${imgAttr}>`;
      // tooltip表示するテキスト
      const toolTipElement = doc.querySelector('.c-tooltip__text');
      const tooltipText = toolTipElement?.innerHTML || '';

      return {
        type: 'tooltip',
        img: img || '',
        tooltipText: tooltipText,
        original: acvkey,
      };
    }
    return {
      type: 'text',
      img: '',
      tooltipText: '',
      original: acvkey,
    };
  }
}
