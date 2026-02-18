import { HistoryFavoriteGetResponse } from 'src/sdk-search';

/** 型定義 */
export type ApiRequestState = 'unexecuted' | 'calling' | 'complete' | 'failed';

/**
 * SearchFlightHistoryModal model
 */
export interface SearchFlightHistoryModalModel {}

/**
 * HistoryFavoriteGetResponse model details
 */
export interface SearchFlightHistoryModalStateDetails extends HistoryFavoriteGetResponse {
  /* 履歴・お気に入り取得APIのリクエスト状態 */
  apiRequestState: ApiRequestState;
}

/**
 * SearchFlightHistoryModal store state
 */
export interface SearchFlightHistoryModalState extends SearchFlightHistoryModalStateDetails {}

/**
 * Name of the SearchFlightHistoryModal Store
 */
export const SEARCH_FLIGHT_HISTORY_MODAL_STORE_NAME = 'searchFlightHistoryModal';

/**
 * SearchFlightHistoryModal Store Interface
 */
export interface SearchFlightHistoryModalStore {
  /** SearchFlightHistoryModal state */
  [SEARCH_FLIGHT_HISTORY_MODAL_STORE_NAME]: SearchFlightHistoryModalState;
}
