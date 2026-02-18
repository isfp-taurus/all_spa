import { AsyncStoreItem } from '@lib/store';

/**
 * HistoryFavoriteGet model
 */
export interface HistoryFavoriteGetModel {}

/**
 * HistoryFavoriteGetResponse model details
 */
export interface HistoryFavoriteGetStateDetails extends AsyncStoreItem {}

/**
 * HistoryFavoriteGet store state
 */
export interface HistoryFavoriteGetState extends HistoryFavoriteGetStateDetails, HistoryFavoriteGetModel {}

/**
 * Name of the HistoryFavoriteGet Store
 */
export const HISTORY_FAVORITE_GET_STORE_NAME = 'historyFavoriteGet';

/**
 * HistoryFavoriteGet Store Interface
 */
export interface HistoryFavoriteGetStore {
  /** HistoryFavoriteGet state */
  [HISTORY_FAVORITE_GET_STORE_NAME]: HistoryFavoriteGetState;
}
