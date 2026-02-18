import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './roundtrip-owd.actions';
import { RoundtripOwdState } from './roundtrip-owd.state';

/**
 * roundtripOwd initial state
 */
export const roundtripOwdInitialState: RoundtripOwdState = {
  requestIds: [],
};

/**
 * List of basic actions for RoundtripOwd Store
 */
export const roundtripOwdReducerFeatures: ReducerTypes<RoundtripOwdState, ActionCreator[]>[] = [
  on(actions.setRoundtripOwd, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateRoundtripOwd, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetRoundtripOwd, () => roundtripOwdInitialState),

  on(actions.cancelRoundtripOwdRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failRoundtripOwd, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setRoundtripOwdFromApi, actions.updateRoundtripOwdFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * RoundtripOwd Store reducer
 */
export const roundtripOwdReducer = createReducer(roundtripOwdInitialState, ...roundtripOwdReducerFeatures);
