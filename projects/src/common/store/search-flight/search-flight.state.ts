import { Airport, ValidationErrorInfo } from '@lib/interfaces';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs/internal/Subscription';
import { DateSelectorParts } from '@lib/components';
import { AirportListParts } from '@lib/components/shared-ui-components/airport/airport.state';

/** 定数定義 */
export const SearchFlightConstant = {
  //** 複雑旅程区間数最大(配列要素番号) */
  MAX_ONEWAY_OR_MULTICITY_BOUNDS_LENGTH: 6,
  /** 出発時間帯 最小値 */
  TIME_WINDOW_MIN: 0,
  /** 出発時間帯 最大値 */
  TIME_WINDOW_MAX: 1439,
  /** 運賃オプション　指定なし */
  UNSPECIFIED_FARE_OPTION: '0',
  /** 搭乗者年齢条件変更インフォメーションID */
  INFO_ID_MSG1029: 'MSG1029',
  /** 搭乗者上限人数変更インフォメーションID */
  INFO_ID_MSG1493: 'MSG1493',
  /** 運賃オプション変更インフォメーションID */
  INFO_ID_MSG1719: 'MSG1719',
};

/** 型定義 */
export type TripType = (typeof TripType)[keyof typeof TripType];
export const TripType = {
  ROUND_TRIP: 0,
  ONEWAY_OR_MULTI_CITY: 1,
  BLANK: 99,
};

export type Bound = {
  /** 出発地 */
  originLocationCode: string | null;
  /** 到着地 */
  destinationLocationCode: string | null;
  /** 乗継地 */
  connectionLocationCode: string | null;
  /** 出発日 */
  departureDate: Date | null;
  /** 出発時間帯開始 */
  departureTimeWindowFrom: number | null;
  /** 出発時間帯終了 */
  departureTimeWindowTo: number | null;
};

export interface ExtraBound extends Bound {
  originLocationName?: string;
  destinationLocationName?: string;
}

/** 複雑旅程1区間の入力値定義 */
export type FormBound = {
  /** 出発地 */
  originLocation: Airport | null;
  /** 到着地 */
  destinationLocation: Airport | null;
  /** 出発日 */
  departureDate: Date | null;
  /** 出発地 */
  originLocationFormControl: FormControl;
  /** 到着地 */
  destinationLocationFormControl: FormControl;
  /** 出発日 */
  departureDateFormControl: FormControl;
  /** 出発時間帯 */
  departureTimeWindow: FormControl;
  /** 出発時間帯フォームコントロールのサブスクリプション */
  subscriptionDepartureTimeWindow: Subscription | null;
  /** 画面項目コンポーネントに渡す設定値*/
  airportListPartsFrom?: AirportListParts;
  /** 画面項目コンポーネントに渡す設定値*/
  airportListPartsTo?: AirportListParts;
  /** 画面項目コンポーネントに渡す設定値*/
  dateSelectorParts?: DateSelectorParts;
};

export interface Information {
  [key: string]: string | ValidationErrorInfo;
  // Các thuộc tính khác của đối tượng information nếu cần
}

export type fare = {
  /** MixedCabim利用有無 */
  isMixedCabin: boolean;
  /** キャビンクラス指定 */
  cabinClass: string;
  /** 運賃オプション */
  fareOptionType: string;
  /** 復路キャビンクラス指定 */
  returnCabinClass: string;
  /** 特典区分指定 */
  awardOption?: string;
};

/**
 * SearchFlight model
 */
export interface SearchFlightModel {}

/**
 * SearchFlight model details
 */
export interface SearchFlightStateDetails {
  /** 国内旅程かどうか */
  isJapanOnly: boolean;
  /** 旅程タイプ */
  tripType: TripType;
  /** 往復旅程検索条件 */
  roundTrip: RoundTrip;
  /**複雑旅程検索条件 */
  onewayOrMultiCity: Array<Bound>;
  /** 搭乗者数 */
  traveler: {
    /** 大人人数 */
    adt: number;
    /** ヤングアダルト人数 */
    b15: number;
    /** 小児人数 */
    chd: number;
    /** 幼児人数 */
    inf: number;
  };
  /** 運賃情報 */
  fare: fare;
  /** プロモーション情報 */
  promotion: {
    /** プロモーションコード */
    code: string;
  };
  /** 追加処理情報 */
  searchPreferences: {
    /** 前後日付表示オプション */
    getAirCalendarOnly?: boolean;
    /** 最新の運航情報 */
    getLatestOperation?: boolean;
  };
  /** 画面表示用情報 */
  displayInformation: {
    /** 前後日付表示オプション */
    compareFaresNearbyDates: boolean;
    /** 遷移先画面ID */
    nextPage: string;
  };
  /** 最安額連携情報 往復空席照会結果(国際)画面(R01-P030)で使用する */
  lowestPrice: {
    /** 案内済最安支払総額 */
    displayedTotalPrice: number | null;
    /** 案内済最安運賃額（税抜） */
    displayedBasePrice: number | null;
    /** 案内済通貨コード */
    displayedCurrency: string | null;
  };
  /** 別予約同行者情報 */
  hasAccompaniedInAnotherReservation: boolean | null;
  /** DCS移行開始日前後状態 */
  dcsMigrationDateStatus: string;
}

/**
 * SearchFlight store state
 */
export interface SearchFlightState extends SearchFlightStateDetails {}

/** 往復旅程検索条件 */
export type RoundTrip = {
  /** 往路出発地 */
  departureOriginLocationCode: string | null;
  /** 往路到着地 */
  departureDestinationLocationCode: string | null;
  /** 往路出発日 */
  departureDate: Date | null;
  /** 往路出発時間帯開始 */
  departureTimeWindowFrom: number | null;
  /** 往路出発時間帯終了 */
  departureTimeWindowTo: number | null;
  /** 復路出発地 */
  returnOriginLocationCode: string | null;
  /** 復路到着地 */
  returnDestinationLocationCode: string | null;
  /** 復路出発日 */
  returnDate: Date | null;
  /** 復路出発時間帯開始 */
  returnTimeWindowFrom: number | null;
  /** 復路出発時間帯終了 */
  returnTimeWindowTo: number | null;
  /** 往路乗継情報 */
  departureConnection: {
    /** 乗継地 */
    connectionLocationCode: string | null;
    /** 最低乗継時間 */
    connectionTime: number | null;
  };
  /** 復路乗継情報 */
  returnConnection: {
    /** 乗継地 */
    connectionLocationCode: string | null;
    /** 最低乗継時間 */
    connectionTime: number | null;
  };
  /** 区間オプション表示 */
  isOpenSearchOption?: boolean;
};

/**
 * Name of the SearchFlight Store
 */
export const SEARCH_FLIGHT_STORE_NAME = 'searchFlight';

/**
 * SearchFlight Store Interface
 */
export interface SearchFlightStore {
  /** SearchFlight state */
  [SEARCH_FLIGHT_STORE_NAME]: SearchFlightState;
}
