/**
 * 検索実行の種類
 *
 * DEFAULT・OUT_CALENDAR・CABIN_CHANGE・FARE_OPTION_CHANGE: [空席照会処理]を行う、特に処理なし
 * OUT_FF_SELECT・RETURN_CALENDAR・FILTER_SEARCH: [変更旅程空席照会API呼び出し処理]を行う、個別処理必要です
 */
export type SEARCH_TYPE =
  | 'default'
  | 'outFFselect'
  | 'outCalendar'
  | 'returnCalendar'
  | 'cabinChange'
  | 'fareOptionChange'
  | 'filterSearch';
export const SEARCH_TYPE = {
  /** デフォルト処理、特に処理なし */
  DEFAULT: 'default' as SEARCH_TYPE,
  /** 往復の場合、FFのmodelから往路が選択済み、復路のapiレスポンス場合 */
  OUT_FF_SELECT: 'outFFselect' as SEARCH_TYPE,
  /** 7日間カレンダー(往路)選択から、往路のapiレスポンス場合 */
  OUT_CALENDAR: 'outCalendar' as SEARCH_TYPE,
  /** 7日間カレンダー(復路)選択から、復路のapiレスポンス場合 */
  RETURN_CALENDAR: 'returnCalendar' as SEARCH_TYPE,
  /** 運賃オプションモーダル適用ボタン押下処理 */
  FARE_OPTION_CHANGE: 'fareOptionChange' as SEARCH_TYPE,
  /** フィルタ条件モーダル適用ボタン押下処理 */
  FILTER_SEARCH: 'filterSearch' as SEARCH_TYPE,
};

/**
 * 選択したTSおよびFFの情報の処理種類
 */
export type SELECTED_TS_FF_TYPE = 'init' | 'out' | 'return' | 'returnReset' | 'outReset';
export const SELECTED_TS_FF_TYPE = {
  INIT: 'init' as SELECTED_TS_FF_TYPE,
  OUT: 'out' as SELECTED_TS_FF_TYPE,
  RETURN: 'return' as SELECTED_TS_FF_TYPE,
  RETURN_RESET: 'returnReset' as SELECTED_TS_FF_TYPE,
  OUT_RESET: 'outReset' as SELECTED_TS_FF_TYPE,
};
