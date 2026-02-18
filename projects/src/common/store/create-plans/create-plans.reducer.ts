import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './create-plans.actions';
import { CreatePlansState } from './create-plans.state';

/**
 * createPlans initial state
 */
export const createPlansInitialState: CreatePlansState = {
  requestIds: [],
};

/**
 * List of basic actions for CreatePlans Store
 */
export const createPlansReducerFeatures: ReducerTypes<CreatePlansState, ActionCreator[]>[] = [
  on(actions.setCreatePlans, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateCreatePlans, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetCreatePlans, () => createPlansInitialState),

  on(actions.cancelCreatePlansRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failCreatePlans, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setCreatePlansFromApi, actions.updateCreatePlansFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * CreatePlans Store reducer
 */
export const createPlansReducer = createReducer(createPlansInitialState, ...createPlansReducerFeatures);
