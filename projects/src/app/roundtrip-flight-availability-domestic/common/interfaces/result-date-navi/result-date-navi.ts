import {
  RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodDepartureDatesInnerCheapestPrice,
  RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodReturnDatesInnerCheapestPrice,
} from '../../sdk';

/**
 * カレンダー日付
 */
export interface ResultDateNavi {
  state: ResultDateNaviStateEnum;
  date: string;
  cheapestPrice:
    | RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodDepartureDatesInnerCheapestPrice
    | RoundtripFppItemAirCalendarDataTypeAirCalendarPeriodReturnDatesInnerCheapestPrice;
}

/**
 * カレンダー日付表示タイプ
 */
export enum ResultDateNaviStateEnum {
  /**
   * 背景色青および文字色ネイビーで表示かつネイビーで囲い表示
   */
  VIEW = 'view',
  /**
   * 背景色グレーおよび文字色濃いグレーで非活性で表示
   */
  DISABLED = 'disabled',
  /**
   * 背景色青および文字色ネイビーで表示かつネイビーで囲い表示
   */
  SELECTED = 'selected',
}
