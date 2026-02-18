import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './search-flight.actions';
import { SearchFlightState, TripType, SearchFlightConstant } from './search-flight.state';

/**
 * searchFlight initial state
 */
export const searchFlightInitialState: SearchFlightState = {
  /** 国内旅程かどうか */
  isJapanOnly: true,
  /** 旅程タイプ */
  tripType: TripType.ROUND_TRIP,
  /** 往復旅程検索条件 */
  roundTrip: {
    /** 往路出発地 */
    departureOriginLocationCode: null,
    /** 往路到着地 */
    departureDestinationLocationCode: null,
    /** 往路出発日 */
    departureDate: null,
    /** 往路出発時間帯開始 */
    departureTimeWindowFrom: SearchFlightConstant.TIME_WINDOW_MIN,
    /** 往路出発時間帯終了 */
    departureTimeWindowTo: SearchFlightConstant.TIME_WINDOW_MAX,
    /** 復路出発地 */
    returnOriginLocationCode: null,
    /** 復路到着地 */
    returnDestinationLocationCode: null,
    /** 復路出発日 */
    returnDate: null,
    /** 復路出発時間帯開始 */
    returnTimeWindowFrom: SearchFlightConstant.TIME_WINDOW_MIN,
    /** 復路出発時間帯終了 */
    returnTimeWindowTo: SearchFlightConstant.TIME_WINDOW_MAX,
    /** 往路乗継情報 */
    departureConnection: {
      /** 乗継地 */
      connectionLocationCode: null,
      /** 最低乗継時間 */
      connectionTime: null,
    },
    /** 復路乗継情報 */
    returnConnection: {
      /** 乗継地 */
      connectionLocationCode: null,
      /** 最低乗継時間 */
      connectionTime: null,
    },
  },
  /**複雑旅程検索条件 */
  onewayOrMultiCity: [
    {
      /** 出発地 */
      originLocationCode: null,
      /** 到着地 */
      destinationLocationCode: null,
      /** 乗継地 */
      connectionLocationCode: null,
      /** 出発日 */
      departureDate: null,
      /** 出発時間帯開始 */
      departureTimeWindowFrom: SearchFlightConstant.TIME_WINDOW_MIN,
      /** 出発時間帯終了 */
      departureTimeWindowTo: SearchFlightConstant.TIME_WINDOW_MAX,
    },
  ],
  /** 搭乗者数 */
  traveler: {
    /** 大人人数 */
    adt: 1,
    /** ヤングアダルト人数 */
    b15: 0,
    /** 小児人数 */
    chd: 0,
    /** 幼児人数 */
    inf: 0,
  },
  /** 運賃情報 */
  fare: {
    /** MixedCabim利用有無 */
    isMixedCabin: false,
    /** キャビンクラス指定 */
    cabinClass: '',
    /** 運賃オプション */
    fareOptionType: '',
    /** 復路キャビンクラス指定 */
    returnCabinClass: '',
  },
  /** プロモーション情報 */
  promotion: {
    /** プロモーションコード */
    code: '',
  },
  /** 追加処理情報 */
  searchPreferences: {
    getAirCalendarOnly: false,
    getLatestOperation: false,
  },
  /** 画面表示用情報 */
  displayInformation: {
    /** 前後日付表示オプション */
    compareFaresNearbyDates: true,
    /** 遷移先画面ID */
    nextPage: '',
  },
  /** 最安額連携情報 往復空席照会結果(国際)画面(R01-P030)で使用する */
  lowestPrice: {
    /** 案内済最安支払総額 */
    displayedTotalPrice: null,
    /** 案内済最安運賃額（税抜） */
    displayedBasePrice: null,
    /** 案内済通貨コード */
    displayedCurrency: null,
  },
  /** 別予約同行者情報 */
  hasAccompaniedInAnotherReservation: null,
  /** DCS移行開始日前後状態 */
  dcsMigrationDateStatus: '',
};

/**
 * List of basic actions for SearchFlight Store
 */
export const searchFlightReducerFeatures: ReducerTypes<SearchFlightState, ActionCreator[]>[] = [
  on(actions.setSearchFlight, (_state, payload) => ({ ...payload })),

  on(actions.updateSearchFlight, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetSearchFlight, () => searchFlightInitialState),
];

/**
 * SearchFlight Store reducer
 */
export const searchFlightReducer = createReducer(searchFlightInitialState, ...searchFlightReducerFeatures);
