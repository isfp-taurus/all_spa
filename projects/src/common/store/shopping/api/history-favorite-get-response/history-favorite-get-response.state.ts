import { AsyncStoreItem } from '@lib/store';
import { HistoryFavoriteGetResponse } from 'src/sdk-search/model/historyFavoriteGetResponse';

/**
 * HistoryFavoriteGetResponse model
 */
export interface HistoryFavoriteGetResponseModel {
  model: HistoryFavoriteGetResponse | null;
}

/**
 *  HistoryFavoriteGetResponse model details
 */
export interface HistoryFavoriteGetResponseStateDetails extends AsyncStoreItem {}

/**
 * HistoryFavoriteGetResponse store state
 */
export interface HistoryFavoriteGetResponseState
  extends HistoryFavoriteGetResponseStateDetails,
    HistoryFavoriteGetResponseModel {}

/**
 * Name of the HistoryFavoriteGetResponse Store
 */
export const HISTORY_FAVORITE_GET_RESPONSE_STORE_NAME = 'historyFavoriteGetResponse';

/**
 * HistoryFavoriteGetResponse Store Interface
 */
export interface HistoryFavoriteGetResponseStore {
  /** HistoryFavoriteGetResponse state */
  [HISTORY_FAVORITE_GET_RESPONSE_STORE_NAME]: HistoryFavoriteGetResponseState;
}
