import {
  ComplexCalendarResponseDataAirCalendarInnerTotalPrice,
  ComplexCalendarResponse,
  ComplexCalendarRequest,
  HistoryFavoriteGetResponse,
} from 'src/sdk-search';
import { SearchFlightState } from '@common/store';
/**
 * ComplexFlightCalendar model
 */
export interface ComplexFlightCalendarModel {
  /** 遷移元画面 */
  previousId?: string;
  /** 空席照会日時 */
  baseDate?: Date;
  /** お気に入り登録済み */
  favoriteFlag?: Boolean;
  /** 選択金額 */
  selectedAmount?: ComplexCalendarResponseDataAirCalendarInnerTotalPrice;
  /** 複雑カレンダー空席照会結果 */
  complexCalendarResponseFromStore?: ComplexCalendarResponse;
  /** 複雑カレンダー空席照会リクエスト */
  complexCalendarRequest?: ComplexCalendarRequest;
  /** フライト検索の入力情報 */
  searchFlight?: SearchFlightState;
  /** 履歴・お気に入り得レスポンス型 */
  historyFavoriteResponseFromStore?: HistoryFavoriteGetResponse;
  /** お気に入り追加ボタンアニメーションが不要か */
  isNotFavoriteAnimation?: boolean;
  /** 前期間リンクボタンの表示日数 */
  daysOfPreviousPeriod?: number;
}

/**
 *  model details
 */
export interface ComplexFlightCalendarStateDetails extends ComplexFlightCalendarModel {}

/**
 * ComplexFlightCalendar store state
 */
export interface ComplexFlightCalendarState extends ComplexFlightCalendarStateDetails {}

/**
 * Name of the ComplexFlightCalendar Store
 */
export const COMPLEX_FLIGHT_CALENDAR_STORE_NAME = 'ComplexFlightCalendar';

/**
 * ComplexFlightCalendar Store Interface
 */
export interface ComplexFlightCalendarStore {
  /** ComplexFlightCalendar state */
  [COMPLEX_FLIGHT_CALENDAR_STORE_NAME]: ComplexFlightCalendarState;
}
