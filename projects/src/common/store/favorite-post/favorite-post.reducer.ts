import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './favorite-post.actions';
import { FavoritePostState } from './favorite-post.state';

/**
 * favoritePost initial state
 */
export const favoritePostInitialState: FavoritePostState = {
  requestIds: [],
};

/**
 * List of basic actions for FavoritePost Store
 */
export const favoritePostReducerFeatures: ReducerTypes<FavoritePostState, ActionCreator[]>[] = [
  on(actions.setFavoritePost, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateFavoritePost, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetFavoritePost, () => favoritePostInitialState),

  on(actions.cancelFavoritePostRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failFavoritePost, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setFavoritePostFromApi, actions.updateFavoritePostFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * FavoritePost Store reducer
 */
export const favoritePostReducer = createReducer(favoritePostInitialState, ...favoritePostReducerFeatures);
