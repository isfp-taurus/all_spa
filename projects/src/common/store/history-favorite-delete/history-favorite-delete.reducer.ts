import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './history-favorite-delete.actions';
import { HistoryFavoriteDeleteState } from './history-favorite-delete.state';

/**
 * historyFavoriteDelete initial state
 */
export const historyFavoriteDeleteInitialState: HistoryFavoriteDeleteState = {
  requestIds: [],
};

/**
 * List of basic actions for HistoryFavoriteDelete Store
 */
export const historyFavoriteDeleteReducerFeatures: ReducerTypes<HistoryFavoriteDeleteState, ActionCreator[]>[] = [
  on(actions.setHistoryFavoriteDelete, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateHistoryFavoriteDelete, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetHistoryFavoriteDelete, () => historyFavoriteDeleteInitialState),

  on(actions.cancelHistoryFavoriteDeleteRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failHistoryFavoriteDelete, (state, payload) =>
    asyncStoreItemAdapter.failRequest(state, payload.requestId)
  ),

  on(actions.setHistoryFavoriteDeleteFromApi, actions.updateHistoryFavoriteDeleteFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * HistoryFavoriteDelete Store reducer
 */
export const historyFavoriteDeleteReducer = createReducer(
  historyFavoriteDeleteInitialState,
  ...historyFavoriteDeleteReducerFeatures
);
