import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './get-plans.actions';
import { GetPlansState } from './get-plans.state';

/**
 * getPlans initial state
 */
export const getPlansInitialState: GetPlansState = {
  requestIds: [],
};

/**
 * List of basic actions for GetPlans Store
 */
export const getPlansReducerFeatures: ReducerTypes<GetPlansState, ActionCreator[]>[] = [
  on(actions.setGetPlans, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateGetPlans, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetGetPlans, () => getPlansInitialState),

  on(actions.cancelGetPlansRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failGetPlans, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setGetPlansFromApi, actions.updateGetPlansFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * GetPlans Store reducer
 */
export const getPlansReducer = createReducer(getPlansInitialState, ...getPlansReducerFeatures);
