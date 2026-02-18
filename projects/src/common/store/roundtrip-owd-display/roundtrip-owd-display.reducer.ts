import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './roundtrip-owd-display.actions';
import { RoundtripOwdDisplayState } from './roundtrip-owd-display.state';

/**
 * roundtripOwdDisplay initial state
 */
export const roundtripOwdDisplayInitialState: RoundtripOwdDisplayState = {
  requestIds: [],
};

/**
 * List of basic actions for RoundtripOwdDisplay Store
 */
export const roundtripOwdDisplayReducerFeatures: ReducerTypes<RoundtripOwdDisplayState, ActionCreator[]>[] = [
  on(actions.setRoundtripOwdDisplay, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateRoundtripOwdDisplay, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetRoundtripOwdDisplay, () => roundtripOwdDisplayInitialState),

  on(actions.cancelRoundtripOwdDisplayRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failRoundtripOwdDisplay, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setRoundtripOwdDisplayFromApi, actions.updateRoundtripOwdDisplayFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * RoundtripOwdDisplay Store reducer
 */
export const roundtripOwdDisplayReducer = createReducer(
  roundtripOwdDisplayInitialState,
  ...roundtripOwdDisplayReducerFeatures
);
