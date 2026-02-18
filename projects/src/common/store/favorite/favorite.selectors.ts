import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FAVORITE_STORE_NAME, FavoriteState } from './favorite.state';

/** Select Favorite State */
export const selectFavoriteState = createFeatureSelector<FavoriteState>(FAVORITE_STORE_NAME);

/** Select Favorite isPending status */
export const selectFavoriteIsPendingStatus = createSelector(selectFavoriteState, (state) => !!state.isPending);

/** Select Favorite isFailure status */
export const selectFavoriteIsFailureStatus = createSelector(selectFavoriteState, (state) => !!state.isFailure);
