import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './roundtrip-fpp.actions';
import { RoundtripFppState } from './roundtrip-fpp.state';

/**
 * roundtripFpp initial state
 */
export const roundtripFppInitialState: RoundtripFppState = {
  model: null,
  requestIds: [],
};

/**
 * List of basic actions for RoundtripFpp Store
 */
export const roundtripFppReducerFeatures: ReducerTypes<RoundtripFppState, ActionCreator[]>[] = [
  on(actions.setRoundtripFpp, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateRoundtripFpp, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetRoundtripFpp, () => roundtripFppInitialState),

  on(actions.cancelRoundtripFppRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failRoundtripFpp, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setRoundtripFppFromApi, actions.updateRoundtripFppFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * RoundtripFpp Store reducer
 */
export const roundtripFppReducer = createReducer(roundtripFppInitialState, ...roundtripFppReducerFeatures);
