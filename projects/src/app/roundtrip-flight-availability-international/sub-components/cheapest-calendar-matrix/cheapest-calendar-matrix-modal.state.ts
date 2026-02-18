import { Subject } from 'rxjs';

/** マトリクス形式７日間カレンダーの画面描画用データ */
export type CheapestCalendarData = {
  /** マトリクス用カレンダー日付 往路出発日*/
  departureDateList?: string[];
  /** マトリクス用カレンダー日付 復路出発日*/
  returnDateList?: string[];
  /** マトリクス用カレンダーデータ APIレスポンスのairCalendarより取得  */
  airCalendarCellList?: AirCalendarCell[][];
  /** 選択中の往路出発日 */
  selectedDepartureDate?: string;
  /** 選択中の復路出発日 */
  selectedReturnDate?: string;
  /** 旅行者の合計数 */
  totalTravelers?: number;
};

export type AirCalendarCell = {
  /** 表示対象フラグ */
  isDisplay: boolean;
  /** 利用可能フラグ */
  isAvaliable: boolean;
  /** 往路出発日 */
  departureDate: string;
  /** 復路出発日 */
  returnDate: string;
  /** 通貨記号 */
  currencySymbol: string;
  /** 支払総額 */
  price: number;
  /** 最安支払い総額であるフラグ */
  isLowestPrice: boolean;
};

const InitialAirCalendarCell: AirCalendarCell = {
  isDisplay: false,
  isAvaliable: false,
  departureDate: '',
  returnDate: '',
  currencySymbol: '',
  price: 0,
  isLowestPrice: false,
};

export const NotEnabledCell = {
  ...InitialAirCalendarCell,
  isEnabled: false,
};

export const NotAvaliableCell = {
  ...InitialAirCalendarCell,
  isEnabled: true,
  isAvaliable: false,
};

/** モーダルに渡すデータ */
export type CheapestCalendarModalInput = {
  data?: CheapestCalendarData;
  /** 値をモーダル外に渡す用のサブジェクト */
  outputSubject?: Subject<CheapestCalendarModalOutput>;
};

/** モーダルから返されるデータ */
export type CheapestCalendarModalOutput = {
  /** 往路出発日*/
  departureDate: string;
  /** 復路出発日*/
  returnDate: string;
};
