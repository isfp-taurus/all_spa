import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './favorite.actions';
import { FavoriteState } from './favorite.state';

/**
 * favorite initial state
 */
export const favoriteInitialState: FavoriteState = {
  requestIds: [],
};

/**
 * List of basic actions for Favorite Store
 */
export const favoriteReducerFeatures: ReducerTypes<FavoriteState, ActionCreator[]>[] = [
  on(actions.setFavorite, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateFavorite, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetFavorite, () => favoriteInitialState),

  on(actions.cancelFavoriteRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failFavorite, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setFavoriteFromApi, actions.updateFavoriteFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * Favorite Store reducer
 */
export const favoriteReducer = createReducer(favoriteInitialState, ...favoriteReducerFeatures);
