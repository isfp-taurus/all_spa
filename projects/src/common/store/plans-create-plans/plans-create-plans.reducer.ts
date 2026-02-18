import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './plans-create-plans.actions';
import { PlansCreatePlansState } from './plans-create-plans.state';

/**
 * plansCreatePlans initial state
 */
export const plansCreatePlansInitialState: PlansCreatePlansState = {
  requestIds: [],
};

/**
 * List of basic actions for PlansCreatePlans Store
 */
export const plansCreatePlansReducerFeatures: ReducerTypes<PlansCreatePlansState, ActionCreator[]>[] = [
  on(actions.setPlansCreatePlans, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updatePlansCreatePlans, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetPlansCreatePlans, () => plansCreatePlansInitialState),

  on(actions.cancelPlansCreatePlansRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failPlansCreatePlans, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setPlansCreatePlansFromApi, actions.updatePlansCreatePlansFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * PlansCreatePlans Store reducer
 */
export const plansCreatePlansReducer = createReducer(plansCreatePlansInitialState, ...plansCreatePlansReducerFeatures);
