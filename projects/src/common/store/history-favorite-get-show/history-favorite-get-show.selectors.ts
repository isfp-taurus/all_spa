import { createFeatureSelector, createSelector } from '@ngrx/store';
import { HISTORY_FAVORITE_GET_SHOW_STORE_NAME, HistoryFavoriteGetShowState } from './history-favorite-get-show.state';

/** Select HistoryFavoriteGetShow State */
export const selectHistoryFavoriteGetShowState = createFeatureSelector<HistoryFavoriteGetShowState>(
  HISTORY_FAVORITE_GET_SHOW_STORE_NAME
);

/** Select HistoryFavoriteGetShow isPending status */
export const selectHistoryFavoriteGetShowIsPendingStatus = createSelector(
  selectHistoryFavoriteGetShowState,
  (state) => !!state.isPending
);

/** Select HistoryFavoriteGetShow isFailure status */
export const selectHistoryFavoriteGetShowIsFailureStatus = createSelector(
  selectHistoryFavoriteGetShowState,
  (state) => !!state.isFailure
);
