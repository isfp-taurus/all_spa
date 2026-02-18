import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './history-favorite-get-show.actions';
import { HistoryFavoriteGetShowState } from './history-favorite-get-show.state';

/**
 * historyFavoriteGetShow initial state
 */
export const historyFavoriteGetShowInitialState: HistoryFavoriteGetShowState = {
  requestIds: [],
};

/**
 * List of basic actions for HistoryFavoriteGetShow Store
 */
export const historyFavoriteGetShowReducerFeatures: ReducerTypes<HistoryFavoriteGetShowState, ActionCreator[]>[] = [
  on(actions.setHistoryFavoriteGetShow, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateHistoryFavoriteGetShow, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetHistoryFavoriteGetShow, () => historyFavoriteGetShowInitialState),

  on(actions.cancelHistoryFavoriteGetShowRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failHistoryFavoriteGetShow, (state, payload) =>
    asyncStoreItemAdapter.failRequest(state, payload.requestId)
  ),

  on(actions.setHistoryFavoriteGetShowFromApi, actions.updateHistoryFavoriteGetShowFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * HistoryFavoriteGetShow Store reducer
 */
export const historyFavoriteGetShowReducer = createReducer(
  historyFavoriteGetShowInitialState,
  ...historyFavoriteGetShowReducerFeatures
);
