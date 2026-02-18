import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './history.actions';
import { HistoryState } from './history.state';

/**
 * history initial state
 */
export const historyInitialState: HistoryState = {
  requestIds: [],
};

/**
 * List of basic actions for History Store
 */
export const historyReducerFeatures: ReducerTypes<HistoryState, ActionCreator[]>[] = [
  on(actions.setHistory, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateHistory, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetHistory, () => historyInitialState),

  on(actions.cancelHistoryRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failHistory, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setHistoryFromApi, actions.updateHistoryFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * History Store reducer
 */
export const historyReducer = createReducer(historyInitialState, ...historyReducerFeatures);
