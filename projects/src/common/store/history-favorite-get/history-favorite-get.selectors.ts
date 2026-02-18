import { createFeatureSelector, createSelector } from '@ngrx/store';
import { HISTORY_FAVORITE_GET_STORE_NAME, HistoryFavoriteGetState } from './history-favorite-get.state';

/** Select HistoryFavoriteGet State */
export const selectHistoryFavoriteGetState = createFeatureSelector<HistoryFavoriteGetState>(
  HISTORY_FAVORITE_GET_STORE_NAME
);

/** Select HistoryFavoriteGet isPending status */
export const selectHistoryFavoriteGetIsPendingStatus = createSelector(
  selectHistoryFavoriteGetState,
  (state) => !!state.isPending
);

/** Select HistoryFavoriteGet isFailure status */
export const selectHistoryFavoriteGetIsFailureStatus = createSelector(
  selectHistoryFavoriteGetState,
  (state) => !!state.isFailure
);
