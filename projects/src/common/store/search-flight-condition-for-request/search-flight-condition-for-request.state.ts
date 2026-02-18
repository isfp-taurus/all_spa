import { AsyncStoreItem } from '@lib/store';
import { Promotion, RoundtripOwdRequestItinerariesInner } from 'src/sdk-search';

/**
 * SearchFlightConditionForRequest model
 */
export interface SearchFlightConditionForRequestModel extends SearchFlightConditionForRequest {}

/**
 * serchFlightConditionForRequest model details
 */
export interface SearchFlightConditionForRequestStateDetails extends AsyncStoreItem {}

/**
 * SearchFlightConditionForRequest store state
 */
export interface SearchFlightConditionForRequestState
  extends SearchFlightConditionForRequestStateDetails,
    SearchFlightConditionForRequestModel {}

export type Itinerary = {
  /** 出発空港コード */
  originLocationCode: string | null;
  /** 到着空港コード */
  destinationLocationCode: string | null;
  /** 出発日(yyyy-MM-dd) */
  departureDate: string | null;
  /** 出発開始時刻(HH:mm:ss) */
  departureTimeWindowFrom: string | null;
  /** 出発終了時刻(HH:mm:ss) */
  departureTimeWindowTo: string | null;
  /** 乗り継ぎ情報 */
  connection: {
    /** 乗り継ぎ空港コード */
    locationCode: string | null;
    /** 乗り継ぎ時間(分単位) */
    time: number | null;
  };
};

/**
 * SearchFlightMerged model
 */
export interface Model {}

/**
 * SearchFlightMerged store state
 */
export interface SearchFlightConditionForRequest {
  /** 往復指定日空席照会(OWD)用APIリクエスト情報 */
  request: {
    /** 検索条件情報 */
    itineraries: Array<RoundtripOwdRequestItinerariesInner>;
    /** 搭乗者数 */
    travelers: {
      /** 大人人数 */
      ADT: number;
      /** ヤングアダルト人数 */
      B15: number;
      /** 小児人数 */
      CHD: number;
      /** 幼児人数 */
      INF: number;
    };
    /** 別予約同行者有無 */
    hasAccompaniedInAnotherReservation?: boolean;
    /** 運賃情報 */
    fare: {
      /** Mixed Cabin選択有無 */
      isMixedCabin: boolean;
      /** キャビンクラス */
      cabinClass?: string;
      /** 運賃オプション */
      fareOptionType?: string;
      /** Mixed Cabin情報 */
      mixedCabinClasses?: {
        /** 往路キャビンクラス */
        departureCabinClass: string;
        /** 復路キャビンクラス */
        returnCabinClass: string;
      };
    };
    /** プロモーション情報 */
    promotion?: Promotion;
    /** 追加処理情報 */
    searchPreferences?: {
      /** 前後日付表示オプション */
      getAirCalendarOnly?: boolean;
      /** 最新の運航情報 */
      getLatestOperation?: boolean;
    };
    /** 画面表示用情報 */
    displayInformation?: {
      /** 遷移先画面ID */
      nextPage: string | null;
    };
    /** 検索フォームより遷移 */
    searchFormFlg: boolean;
  };
}

/**
 * Name of the SearchFlightConditionForRequest Store
 */
export const SEARCH_FLIGHT_CONDITION_FOR_REQUEST_STORE_NAME = 'searchFlightConditionForRequest';

/**
 * SearchFlightConditionForRequest Store Interface
 */
export interface SearchFlightConditionForRequestStore {
  /** SearchFlightConditionForRequest state */
  [SEARCH_FLIGHT_CONDITION_FOR_REQUEST_STORE_NAME]: SearchFlightConditionForRequestState;
}
