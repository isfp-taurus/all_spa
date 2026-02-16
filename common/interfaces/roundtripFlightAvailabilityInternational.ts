import { FlightType } from '@common/components';
import { SearchFlightStateDetails } from '@common/store';
import { Subject } from 'rxjs';
import { fareCabinClass } from '@common/interfaces/shopping/fareOption';
import { AirCalendar, AirCalendarPeriod, RoundtripOwdRequest } from '@common/interfaces/shopping/roundtrip-owd';
import { FareFamilies, AirOffer } from '@common/interfaces/shopping/roundtrip-owd';

/**
 * 往復空席照会結果(国際)Store Model
 */
export interface RoundtripFlightAvailabilityInternationalStoreModel {
  /** フライト検索の入力情報 */
  searchFlight?: SearchFlightStateDetails;
  /** 検索条件変更有無 */
  isChangeSearchData?: boolean;
  /** 履歴登録要否 */
  isHistoryRegistration?: boolean;
  /** 最安運賃を選択する必要があるかどうか */
  isSelectLowestFare?: boolean;

  /** 往復指定日空席照会(OWD)用APIリクエスト情報 */
  roundtripOwdRequest?: RoundtripOwdRequest;

  /** 指定日検索結果有無 */
  isSearchResultOfSpecifiedDate?: boolean;
  /** お気に入り登録済み */
  isRegisteredFavorite?: boolean;
  /** お気に入り追加ボタンアニメーションが不要か */
  isNotFavoriteAnimation?: boolean;
  /**
   * 往路選択済み状態
   * ※検索結果リスト、選択中TS・FF情報のどちらを表示するかと連動する状態。選択済みの場合は選択中TS・FF情報を表示する。
   */
  isSelectedOutbound?: boolean;
  /** 復路選択済み状態 */
  isSelectedReturnTrip?: boolean;
  /** ソート条件 */
  sortTerms?: string;
  /** 運賃オプション */
  fareOption?: string;
  /** キャビンクラス */
  cabinClass?: string;
  /** 往復かどうか */
  isRoundtrip?: boolean;
  /** 現在の往路日付 */
  currentOutboundDate?: string;
  /** 現在の復路日付 */
  currentReturnTripDate?: string;
  /** 検索結果旅程種別 */
  searchResultItineraryType?: FlightType;
  /** 最安額連携有無 */
  isLowestPriceCoordination?: boolean;
  /** 検索結果リスト往路プロモーション適用結果有無 */
  isOutboundPromotionApplied?: boolean;
  /** 検索結果リスト復路プロモーション適用結果有無 */
  isReturnTripPromotionApplied?: boolean;
  /** 選択中TS・FF情報往路プロモーション適用凡例結果有無 */
  isSelectedOutboundPromotionApplied?: boolean;
  /** 選択中TS・FF情報復路プロモーション適用凡例結果有無 */
  isSelectedReturnTripPromotionApplied?: boolean;
  /** Commercial Fare Family区分 */
  commercialFareFamilyClassification?: string;
  /** 運賃変更案内コンテンツID */
  fareChangeInfoContentID?: string;
  /** 復路選択解除案内コンテンツID */
  returnTripDeselectionInfoContentID?: string;
  /** 選択TS変更案内コンテンツID */
  selectedTsChangeInfoContentID?: string;
  /** 表示TS0件案内コンテンツID */
  displayTs0InfoContentID?: string;
  /** 検索結果フッタ表示状態 */
  searchResultFooterDisplayStatus?: boolean;

  /** 選択中のカレンダー情報 */
  calendarInfo?: CalendarInfo;

  /** 検索条件 */
  searchData?: RoundtripOwdRequest;

  /** アップグレード情報リスト */
  upgradeInfoList?: Array<AirOfferUpgradeInfo>;

  /** 選択中のCFFリスト */
  cffList?: fareCabinClass;

  /** 再検索モーダル表示フラグ */
  isShowSearchagain?: boolean;

  /** FF概要開閉状態 */
  isOpenFareOverview?: boolean;

  /** フィルタ条件入力情報を作成 */
  filterConditionData?: FilterConditionData;

  /** FF選択モーダル表示リスト */
  ffSelectModalList?: Array<ffSelectModalInfo>;

  /** FF名称マップ */
  ffNameMap?: Map<string, string>;

  /** 選択AirOfferId */
  selectAirOfferId?: string;
  /** 選択AirOffer情報 */
  selectAirOfferInfo?: AirOffer;
  /** 選択中往路TSID */
  selectOutboundTSID?: string;
  /** 選択中往路FF */
  selectOutboundFF?: string;
  /** 選択中復路TSID */
  selectReturnTripTSID?: string;
  /** 選択中復路FF */
  selectReturnTripFF?: string;

  /** カウチ対象便ACVコードリスト */
  couchAcvCodeList?: string[];
}

export interface SearchFlight {
  /** 旅程タイプ */
  tripType?: TripType;
  /** 往復旅程検索条件 */
  roundTrip?: {
    /** 往路出発地 */
    departureOriginLocationCode?: string;
    /** 往路到着地 */
    departureDestinationLocationCode?: string;
    /** 往路出発日 */
    departureDate?: Date;
    /** 往路出発時間帯開始 */
    departureTimeWindowFrom?: number;
    /** 往路出発時間帯終了 */
    departureTimeWindowTo?: number;
    /** 復路出発地 */
    returnOriginLocationCode?: string;
    /** 復路到着地 */
    returnDestinationLocationCode?: string;
    /** 復路出発日 */
    returnDate?: Date;
    /** 復路出発時間帯開始 */
    returnTimeWindowFrom?: number;
    /** 復路出発時間帯終了 */
    returnTimeWindowTo?: number;
    /** 往路乗継情報 */
    departureConnection?: {
      /** 乗継地 */
      connectionLocationCode?: string;
      /** 最低乗継時間 */
      connectionTime?: number;
    };
    /** 復路乗継情報 */
    returnConnection?: {
      /** 乗継地 */
      connectionLocationCode?: string;
      /** 最低乗継時間 */
      connectionTime?: number;
    };
  };
  /** 搭乗者数 */
  traveler?: {
    /** 大人人数 */
    adt?: number;
    /** ヤングアダルト人数 */
    b15?: number;
    /** 小児人数 */
    chd?: number;
    /** 幼児人数 */
    inf?: number;
  };
  /** 運賃情報 */
  fare?: {
    /** MixedCabim利用有無 */
    isMixedCabin?: boolean;
    /** キャビンクラス指定 */
    cabinClass?: string;
    /** 運賃オプション */
    fareOptionType?: string;
    /** 復路キャビンクラス指定 */
    returnCabinClass?: string;
  };
  /** プロモーション情報 */
  promotion?: {
    /** プロモーションコード */
    code?: string;
  };
  /** 追加処理情報 */
  searchPreferences?: {
    /** 前後日付表示オプション */
    getAirCalendarOnly?: boolean;
    /** 最新の運航情報 */
    getLatestOperation?: boolean;
  };
  /** 画面表示用情報 */
  displayInformation?: {
    /** 前後日付表示オプション */
    compareFaresNearbyDates?: boolean;
    /** 遷移先画面ID */
    nextPage?: string;
  };
  /** 最安額連携情報 往復空席照会結果(国際)画面(R01-P030)で使用する */
  lowestPrice?: {
    /** 案内済最安支払総額 */
    displayedTotalPrice?: number;
    /** 案内済最安運賃額（税抜） */
    displayedBasePrice?: number;
    /** 案内済通貨コード */
    displayedCurrency?: string;
  };
}

/**
 * 往復指定日空席照会(OWD)用APIリクエスト情報
 */
export interface SearchFlightConditionForRequest {
  /** 往復指定日空席照会(OWD)用APIリクエスト情報 */
  request: {
    /** 検索条件情報 */
    itineraries: Array<Itinerary>;
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
    /** 運賃情報 */
    fare: {
      /** Mixed Cabin選択有無 */
      isMixedCabin: boolean;
      /** キャビンクラス */
      cabinClass: string | null;
      /** 運賃オプション */
      fareOptionType: string | null;
      /** Mixed Cabin情報 */
      mixedCabinClasses?: {
        /** 往路キャビンクラス */
        departureCabinClass: string | null;
        /** 復路キャビンクラス */
        returnCabinClass: string | null;
      };
    };
    /** プロモーション情報 */
    promotion: {
      /** プロモーションコード */
      code: string | null;
    };
  };
}

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
  connection?: {
    /** 乗り継ぎ空港コード */
    locationCode: string;
    /** 乗り継ぎ時間(分単位) */
    time: number | null;
  };
};

/** 選択中のカレンダー情報 */
export type CalendarInfo = {
  /** 往路出発日 */
  outwardDepartureDate?: string | null;
  /** 復路出発日 */
  returnTripDepartureDate?: string | null;
  /** マトリクス用カレンダー日付 */
  matrixCalendarDate?: AirCalendarPeriod;
  /** マトリクス用カレンダー */
  matrixCalendar?: AirCalendar;
};

/** airOffer毎アップグレード情報 */
export type AirOfferUpgradeInfo = {
  /** airOfferId */
  airOfferId?: string;
  /** バウンド毎アップグレード情報リスト */
  boundUpgradeInfoList?: Array<BoundUpgradeInfo>;
};

/** バウンド毎アップグレード情報 */
export type BoundUpgradeInfo = {
  /** travelSolutionId */
  travelSolutionId?: string;
  /** フライト毎アップグレード情報リスト */
  flightUpgradeInfoList?: Array<FlightUpgradeInfo>;
};

/** フライト毎アップグレード情報 */
export type FlightUpgradeInfo = {
  /** セグメントキー */
  segmentKey?: string;
  /** キャビンクラス毎アップグレード情報リスト */
  cabinClassUpgradeInfoList?: Array<CabinClassUpgradeInfo>;
};

/** キャビンクラス毎アップグレード情報 */
export type CabinClassUpgradeInfo = {
  /** キャビンクラス */
  cabinClass?: string;
  /** 残席状況 */
  seatStatus?: string;
  /** 空席数 */
  vacancyNum?: number;
  /** キャビンクラスalt文言 */
  cabinClassAlt?: string;
};

/** フィルター条件モーダル画面描画用データ */
export type FilterConditionData = {
  /** 選択可能な便 */
  isAvailable?: boolean;
  /** 支払総額 下限上限および選択値 */
  budgetRange?: RangeValue;
  /** 運賃タイプ */
  fareType?: Array<FareTypeItem>;
  /** 無料預け入れ手荷物許容量の表示リスト */
  baggageAllowanceList?: Array<FilterItem<number>>;
  /** プロモーション適用Air Offerのみ */
  isOnlyPromotionCodeAvailable?: boolean;
  /** 「プロモーション適用Air Offerのみ」の表示判定用 */
  isPromotionApplied?: boolean;
  /** バウンド毎のフィルタ項目 バウンド毎に選べる区間・乗継数を設定する */
  boundFilterItemList?: Array<BoundFilterItem>;
  upgradableCabinList?: Array<FilterItem<string>>;
  /** FmF 画面用ラベル */
  budgetLabel?: string;
};

/** レンジスライダーの選択値 */
export type RangeValue = {
  /** 下限値 */
  limitMinValue?: number | string;
  /** 上限値 */
  limitMaxValue?: number | string;
  /** 選択中の最小 */
  selectedMinValue?: number | string;
  /** 選択中の最大 */
  selectedMaxValue?: number | string;
};

/** 運賃タイプの情報 */
export type FareTypeItem = {
  /** チェック状態 */
  isEnabled: boolean;
  /** 値 */
  value: string;
  /** 項目名 */
  name: string;
};

/** 項目名または数値とそのチェック状態 */
export type FilterItem<ITEM> = {
  /** 項目名に当たるデータ */
  item?: ITEM;
  /** この項目のチェック状態 */
  isEnabled?: boolean;
};

/** バウンド毎のフィルタ項目 */
export type BoundFilterItem = {
  /** 乗継回数 */
  stops?: Array<FilterItem<number>>;
  /** 総所要時間 下限上限と選択値(単位：秒) */
  durationRange?: RangeValue;
  /** 出発空港 */
  departureAirportList?: Array<CodeFilterItem>;
  /** 出発時間帯 */
  departureTimeRange?: RangeValue;
  /** 到着空港 */
  arrivalAirportList?: Array<CodeFilterItem>;
  /** 到着時間帯 */
  arrivalTimeRange?: RangeValue;
  /** 乗継空港 */
  transitAirportList?: Array<CodeFilterItem>;
  /** 乗継時間 */
  transitTimeRange?: RangeValue;
  /** 乗継時間活性状態 */
  transitTimeRangeEnabled?: boolean;
  /** 運航キャリア */
  operationAirlineList?: Array<FareTypeItem>;
  /** 機種 */
  aircraftList?: Array<FilterItem<string>>;
  /** 備品 */
  equipment?: FilterItem<string>;
};

/** 出発・到着・乗継空港で利用する
 * キャッシュから名称を取得するためのキーとなるコードと
 * 取得できない場合に表示する名称を持つ、フィルタ項目描画用データ */
export type CodeFilterItem = {
  /** 国コード(2レター) ASWDB(マスタ)より、空港コードをキーに取得する */
  countryCode?: string;
  /** 名称のキーとなるコード	*/
  code?: string;
  /** 空港名称 */
  name?: string;
  /** この項目のチェック状態 */
  isEnabled?: boolean;
  /** 有償表示順 */
  displayOrder?: number;
};

/** 旅程種別 */
export type TripTypeEnum = 'roundtrip' | 'onewayOrMulticity';

export type FilterConditionInput = {
  data?: FilterConditionData;
  initialData?: FilterConditionData;
  subject?: Subject<FilterConditionOutput>;
  boundIndex?: number;
};

export type FilterConditionOutput = {
  data?: FilterConditionData;
};

/** 型定義 : TripType */
export type TripType = (typeof TripType)[keyof typeof TripType];
export const TripType = {
  ROUND_TRIP: 0,
  ONEWAY_OR_MULTICITY: 1,
  BLANK: 99,
};

/** FF毎表示内容情報 */
export type ffSelectModalInfo = {
  fareFamily?: FareFamilies;
  displayAirOffer?: AirOffer;
  airOfferId: string;
  upgradeInfo: Array<FlightUpgradeInfo>;
  otherBoundFareChange: boolean;
};
