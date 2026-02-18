import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './history-favorite-get.actions';
import { HistoryFavoriteGetState } from './history-favorite-get.state';

/**
 * historyFavoriteGet initial state
 */
export const historyFavoriteGetInitialState: HistoryFavoriteGetState = {
  requestIds: [],
};

/**
 * List of basic actions for HistoryFavoriteGet Store
 */
export const historyFavoriteGetReducerFeatures: ReducerTypes<HistoryFavoriteGetState, ActionCreator[]>[] = [
  on(actions.setHistoryFavoriteGet, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateHistoryFavoriteGet, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetHistoryFavoriteGet, () => historyFavoriteGetInitialState),

  on(actions.cancelHistoryFavoriteGetRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failHistoryFavoriteGet, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setHistoryFavoriteGetFromApi, actions.updateHistoryFavoriteGetFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * HistoryFavoriteGet Store reducer
 */
export const historyFavoriteGetReducer = createReducer(
  historyFavoriteGetInitialState,
  ...historyFavoriteGetReducerFeatures
);
