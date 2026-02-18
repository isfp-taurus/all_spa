import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './delete-plans.actions';
import { DeletePlansState } from './delete-plans.state';

/**
 * deletePlans initial state
 */
export const deletePlansInitialState: DeletePlansState = {
  requestIds: [],
};

/**
 * List of basic actions for DeletePlans Store
 */
export const deletePlansReducerFeatures: ReducerTypes<DeletePlansState, ActionCreator[]>[] = [
  on(actions.setDeletePlans, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateDeletePlans, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetDeletePlans, () => deletePlansInitialState),

  on(actions.cancelDeletePlansRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failDeletePlans, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setDeletePlansFromApi, actions.updateDeletePlansFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * DeletePlans Store reducer
 */
export const deletePlansReducer = createReducer(deletePlansInitialState, ...deletePlansReducerFeatures);
