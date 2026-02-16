import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './get-approvers.actions';
import { GetApproversState } from './get-approvers.state';

/**
 * getApprovers initial state
 */
export const getApproversInitialState: GetApproversState = {
  requestIds: [],
};

/**
 * List of basic actions for GetApprovers Store
 */
export const getApproversReducerFeatures: ReducerTypes<GetApproversState, ActionCreator[]>[] = [
  on(actions.setGetApprovers, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateGetApprovers, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetGetApprovers, () => getApproversInitialState),

  on(actions.cancelGetApproversRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failGetApprovers, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setGetApproversFromApi, actions.updateGetApproversFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * GetApprovers Store reducer
 */
export const getApproversReducer = createReducer(getApproversInitialState, ...getApproversReducerFeatures);
