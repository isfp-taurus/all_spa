import { createFeatureSelector, createSelector } from '@ngrx/store';
import { HISTORY_FAVORITE_DELETE_STORE_NAME, HistoryFavoriteDeleteState } from './history-favorite-delete.state';

/** Select HistoryFavoriteDelete State */
export const selectHistoryFavoriteDeleteState = createFeatureSelector<HistoryFavoriteDeleteState>(
  HISTORY_FAVORITE_DELETE_STORE_NAME
);

/** Select HistoryFavoriteDelete isPending status */
export const selectHistoryFavoriteDeleteIsPendingStatus = createSelector(
  selectHistoryFavoriteDeleteState,
  (state) => !!state.isPending
);

/** Select HistoryFavoriteDelete isFailure status */
export const selectHistoryFavoriteDeleteIsFailureStatus = createSelector(
  selectHistoryFavoriteDeleteState,
  (state) => !!state.isFailure
);
