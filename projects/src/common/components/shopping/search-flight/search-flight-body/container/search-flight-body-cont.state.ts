import { BehaviorSubject } from 'rxjs';
import { GetMemberInformationState } from '@lib/store';

/** 区間情報リスト(複雑旅程検索条件マージ処理で使用) */
export type BoundToMerge = {
  /** 出発地 */
  originLocationCode: string | null;
  /** 経由地都市 */
  transitLocationCode: string | null;
  /** 到着地 */
  destinationLocationCode: string | null;
  /** 出発日 */
  departureDate: Date | null;
  /** 出発時間帯開始 */
  departureTimeWindowFrom: number | null;
  /** 出発時間帯終了 */
  departureTimeWindowTo: number | null;
  /** 出発空港情報 */
  originAirportInfo: AirportInfo | null;
  /** 到着空港情報 */
  destinationAirportInfo: AirportInfo | null;
  /** マージ対象フラグ */
  mergeFlag: boolean;
};

/** 空港情報(複雑旅程検索条件マージ処理で使用) */
export type AirportInfo = {
  airport_code: string | null;
  city_code: string | null;
  country_2letter_code: string | null;
  country_3letter_code: string | null;
  search_for_airport_code: string | null;
  revenue_region_code: string | null;
  award_region_code: string | null;
  multi_airport_type: string | null;
  da_mail_flag: boolean | null;
  iata_area_code: string | null;
  timetable_display_flag: boolean | null;
  revenue_display_flag: string | null;
  award_display_flag: string | null;
  low_frequency: boolean | null;
  queuing_office_code: string | null;
  queuing_box: string | null;
  queuing_category: string | null;
  adoc_enable_from_date: string | null;
  adoc_enable_to_date: string | null;
  pdf_boarding_pass_available_flag: boolean | null;
  qr_code_boarding_pass_available_flag: boolean | null;
  last_modification_user_id: string | null;
  last_modification_date_time: string | null;
  lang: string | null;
  airport_name: string | null;
  revenue_display_order: number | null;
  award_display_order: number | null;
  main_airport_display_order: number | null;
  i18n_last_modification_date_time: string | null;
};

/** 往復旅程情報(日本国内判断用) */
export type RoundTrip = {
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
export type onewayOrMulticity = {
  /** 出発地 */
  originLocationCode: string | null;
  /** 到着地 */
  destinationLocationCode: string | null;
};

/** フォームを作成 */
export type inputData = {
  name: string;
  value: string;
};

/** bookingType ⇔ awardOption */
export type BookingTypeAwardOptionTypeEnum = 'priced' | 'award' | 'priced/award';
export const BookingTypeAwardOptionTypeEnum = {
  BookingType0: 'priced' as BookingTypeAwardOptionTypeEnum,
  BookingType1: 'award' as BookingTypeAwardOptionTypeEnum,
  BookingType2: 'priced/award' as BookingTypeAwardOptionTypeEnum,
};
/**
 * 動的文言に渡すパラメータ
 * @param planDeleted 削除フラグ
 * @param getMemberInformationReply 会員情報
 */
export interface SearchFlightDynamicParams {
  planDeleted?: boolean;
  getMemberInformationReply?: GetMemberInformationState;
}

export function defaultSearchFlightDynamicParams(): SearchFlightDynamicParams {
  return {
    planDeleted: false,
    getMemberInformationReply: undefined,
  };
}

export const dynamicSubject = new BehaviorSubject<SearchFlightDynamicParams>(defaultSearchFlightDynamicParams());
