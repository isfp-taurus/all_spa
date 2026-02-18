import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  HISTORY_FAVORITE_GET_RESPONSE_STORE_NAME,
  HistoryFavoriteGetResponseState,
} from './history-favorite-get-response.state';

/** Select HistoryFavoriteGetResponse State */
export const selectHistoryFavoriteGetResponseState = createFeatureSelector<HistoryFavoriteGetResponseState>(
  HISTORY_FAVORITE_GET_RESPONSE_STORE_NAME
);

/** Select HistoryFavoriteGetResponse isPending status */
export const selectHistoryFavoriteGetResponseIsPendingStatus = createSelector(
  selectHistoryFavoriteGetResponseState,
  (state) => !!state.isPending
);

/** Select HistoryFavoriteGetResponse isFailure status */
export const selectHistoryFavoriteGetResponseIsFailureStatus = createSelector(
  selectHistoryFavoriteGetResponseState,
  (state) => !!state.isFailure
);
