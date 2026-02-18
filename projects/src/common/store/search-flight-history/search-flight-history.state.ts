import { HistoryFavoriteGetResponse } from 'src/sdk-search';

/** 型定義 */
export type ApiRequestState = 'unexecuted' | 'calling' | 'complete' | 'failed';

/**
 * SearchFlightHistory model
 */
export interface SearchFlightHistoryModel {}

/**
 * SearchFlightHistory model details
 * 履歴・お気に入り取得APIから返されるデータをストアとして保持する
 * API実行後に履歴・お気に入りの編集が可能で、履歴⇔お気に入りの状態を同期する必要があるため
 * 個別ストアで管理する
 */
export interface SearchFlightHistoryStateDetails extends HistoryFavoriteGetResponse {
  /* 履歴・お気に入り取得APIのリクエスト状態 */
  apiRequestState: ApiRequestState;
}

/**
 * SearchFlightHistory store state
 */
export interface SearchFlightHistoryState extends SearchFlightHistoryStateDetails {}

/**
 * Name of the SearchFlightHistory Store
 */
export const SEARCH_FLIGHT_HISTORY_STORE_NAME = 'SearchFlightHistory';

/**
 * SearchFlightHistory Store Interface
 */
export interface SearchFlightHistoryStore {
  /** SearchFlightHistory state */
  [SEARCH_FLIGHT_HISTORY_STORE_NAME]: SearchFlightHistoryState;
}
