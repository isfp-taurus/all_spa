/** 往復旅程 */
export type RoundTrip = {
  originLocationCode: string;
  destinationLocationCode: string;
  originLocationName: string;
  destinationLocationName: string;
  departureDate: string;
  departureDateUnformatted: string;
  departureTimeWindowFrom: string;
  departureTimeWindowTo: string;
  departureTimeWindowFromName: string;
  departureTimeWindowToName: string;
  returnDate: string;
  returnDateUnformatted: string;
  returnTimeWindowFrom: string;
  returnTimeWindowTo: string;
  returnTimeWindowFromName: string;
  returnTimeWindowToName: string;
  departureConnectionLocation: string;
  departureConnectionLocationName: string;
  departureConnectionTime: number;
  departureConnectionTimeHour: number;
  departureConnectionTimeMinutes: number;
  returnConnectionLocation: string;
  returnConnectionLocationName: string;
  returnConnectionTime: number;
  returnConnectionTimeHour: number;
  returnConnectionTimeMinutes: number;
  /** 旅程を2行以上に分ける描画する場合はtrue */
  isMultiLine: boolean;
};

/** 複雑旅程の1区間 */
export type Bound = {
  originLocationCode: string;
  destinationLocationCode: string;
  originLocationName: string;
  destinationLocationName: string;
  departureDate: string;
  departureDateUnformatted: string;
  departureTimeWindowFrom: string;
  departureTimeWindowTo: string;
  departureTimeWindowFromName: string;
  departureTimeWindowToName: string;
};

/** 履歴お気に入り画面表示用 */
export type SearchFlightHistory = {
  creationDateTime: string;
  roundTripFlag: boolean;
  roundTrip: RoundTrip | null;
  bounds: Array<Bound> | null;
  fare: {
    isMixedCabin: boolean;
    cabinClass: string;
    cabinClassName: string;
    fareOptionType: string;
    mixedCabinClasses: {
      departureCabinClass: string;
      departureCabinClassName: string;
      returnCabinClass: string;
      returnCabinClassName: string;
    };
  };
  travelers: {
    ADT: number;
    B15: number;
    CHD: number;
    INF: number;
    /** 画面描画用テキスト、言語によりテキストの並び、区切り文字が異なるためコンポーネント側で制御 */
    displayText: string;
  };
  hasAccompaniedInAnotherReservation: boolean | null;
  promotionCode: string;
  isFavoriteAdded: boolean;
};

/** サービス⇒モーダル部品に渡す値 */
export type SearchFlightHistorySelectModalInput = {
  historyType: 'history' | 'favorite';
};

// 画面の状態
/** 表示モード 0:参照モード 1:削除モード*/
export type HstFvtModeEnum = (typeof HstFvtModeEnum)[keyof typeof HstFvtModeEnum];
export const HstFvtModeEnum = {
  reference: 0,
  delete: 1,
};

/** 往復旅程情報(日本国内判断用) */
export type RoundTripInfo = {
  /** 往路出発地 */
  departureOriginLocationCode: string | null;
  /** 往路乗継地 */
  departureConnectionLocationCode: string | null;
  /** 往路到着地 */
  departureDestinationLocationCode: string | null;
  /** 復路乗継地 */
  returnConnectionLocationCode: string | null;
};

/** 複雑旅程情報(日本国内判断用) */
export type OnewayOrMultiCityInfo = {
  /** 出発地 */
  originLocationCode: string | null;
  /** 到着地 */
  destinationLocationCode: string | null;
};
