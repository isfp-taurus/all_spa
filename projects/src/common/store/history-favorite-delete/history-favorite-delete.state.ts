import { AsyncStoreItem } from '@lib/store';

/**
 * HistoryFavoriteDelete model
 */
export interface HistoryFavoriteDeleteModel {}

/**
 *  model details
 */
export interface HistoryFavoriteDeleteStateDetails extends AsyncStoreItem {}

/**
 * HistoryFavoriteDelete store state
 */
export interface HistoryFavoriteDeleteState extends HistoryFavoriteDeleteStateDetails, HistoryFavoriteDeleteModel {}

/**
 * Name of the HistoryFavoriteDelete Store
 */
export const HISTORY_FAVORITE_DELETE_STORE_NAME = 'historyFavoriteDelete';

/**
 * HistoryFavoriteDelete Store Interface
 */
export interface HistoryFavoriteDeleteStore {
  /** HistoryFavoriteDelete state */
  [HISTORY_FAVORITE_DELETE_STORE_NAME]: HistoryFavoriteDeleteState;
}
