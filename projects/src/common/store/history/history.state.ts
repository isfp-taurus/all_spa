import { AsyncStoreItem } from '@lib/store';
import { HistoryFavoriteGetResponse } from 'src/sdk-search';

/**
 * History model
 */
export interface HistoryModel extends HistoryFavoriteGetResponse {}

/**
 * HistoryResponse model details
 */
export interface HistoryStateDetails extends AsyncStoreItem, HistoryModel {}

/**
 * History store state
 */
export interface HistoryState extends HistoryStateDetails, HistoryModel {}

/**
 * Name of the History Store
 */
export const HISTORY_STORE_NAME = 'history';

/**
 * History Store Interface
 */
export interface HistoryStore {
  /** History state */
  [HISTORY_STORE_NAME]: HistoryState;
}
