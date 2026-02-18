import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './history-favorite-get-response.actions';
import { HistoryFavoriteGetResponseState } from './history-favorite-get-response.state';

/**
 * historyFavoriteGetResponse initial state
 */
export const historyFavoriteGetResponseInitialState: HistoryFavoriteGetResponseState = {
  model: null,
  requestIds: [],
};

/**
 * List of basic actions for HistoryFavoriteGetResponse Store
 */
export const historyFavoriteGetResponseReducerFeatures: ReducerTypes<
  HistoryFavoriteGetResponseState,
  ActionCreator[]
>[] = [
  on(actions.setHistoryFavoriteGetResponse, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateHistoryFavoriteGetResponse, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetHistoryFavoriteGetResponse, () => historyFavoriteGetResponseInitialState),

  on(actions.cancelHistoryFavoriteGetResponseRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failHistoryFavoriteGetResponse, (state, payload) =>
    asyncStoreItemAdapter.failRequest(state, payload.requestId)
  ),

  on(actions.setHistoryFavoriteGetResponseFromApi, actions.updateHistoryFavoriteGetResponseFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * HistoryFavoriteGetResponse Store reducer
 */
export const historyFavoriteGetResponseReducer = createReducer(
  historyFavoriteGetResponseInitialState,
  ...historyFavoriteGetResponseReducerFeatures
);
