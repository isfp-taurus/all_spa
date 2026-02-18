import { AsyncStoreItem } from '@lib/store';

/**
 * HistoryFavoriteGetShow model
 */
export interface HistoryFavoriteGetShowModel {}

/**
 *  model details
 */
export interface HistoryFavoriteGetShowStateDetails extends AsyncStoreItem {}

/**
 * HistoryFavoriteGetShow store state
 */
export interface HistoryFavoriteGetShowState extends HistoryFavoriteGetShowStateDetails, HistoryFavoriteGetShowModel {}

/**
 * Name of the HistoryFavoriteGetShow Store
 */
export const HISTORY_FAVORITE_GET_SHOW_STORE_NAME = 'historyFavoriteGetShow';

/**
 * HistoryFavoriteGetShow Store Interface
 */
export interface HistoryFavoriteGetShowStore {
  /** HistoryFavoriteGetShow state */
  [HISTORY_FAVORITE_GET_SHOW_STORE_NAME]: HistoryFavoriteGetShowState;
}
