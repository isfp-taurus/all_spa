import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FAVORITE_POST_STORE_NAME, FavoritePostState } from './favorite-post.state';

/** Select FavoritePost State */
export const selectFavoritePostState = createFeatureSelector<FavoritePostState>(FAVORITE_POST_STORE_NAME);

/** Select FavoritePost isPending status */
export const selectFavoritePostIsPendingStatus = createSelector(selectFavoritePostState, (state) => !!state.isPending);

/** Select FavoritePost isFailure status */
export const selectFavoritePostIsFailureStatus = createSelector(selectFavoritePostState, (state) => !!state.isFailure);
