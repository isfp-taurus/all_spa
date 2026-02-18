import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './get-estimation.actions';
import { GetEstimationState } from './get-estimation.state';

/**
 * getEstimation initial state
 */
export const getEstimationInitialState: GetEstimationState = {
  requestIds: [],
};

/**
 * List of basic actions for GetEstimation Store
 */
export const getEstimationReducerFeatures: ReducerTypes<GetEstimationState, ActionCreator[]>[] = [
  on(actions.setGetEstimation, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateGetEstimation, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetGetEstimation, () => getEstimationInitialState),

  on(actions.cancelGetEstimationRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failGetEstimation, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setGetEstimationFromApi, actions.updateGetEstimationFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * GetEstimation Store reducer
 */
export const getEstimationReducer = createReducer(getEstimationInitialState, ...getEstimationReducerFeatures);
