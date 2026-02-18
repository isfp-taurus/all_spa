import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './current-plan.actions';
import { CurrentPlanState } from './current-plan.state';

/**
 * currentPlan initial state
 */
export const currentPlanInitialState: CurrentPlanState = {
  requestIds: [],
};

/**
 * List of basic actions for CurrentPlan Store
 */
export const currentPlanReducerFeatures: ReducerTypes<CurrentPlanState, ActionCreator[]>[] = [
  on(actions.setCurrentPlan, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateCurrentPlan, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetCurrentPlan, () => currentPlanInitialState),

  on(actions.cancelCurrentPlanRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failCurrentPlan, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setCurrentPlanFromApi, actions.updateCurrentPlanFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * CurrentPlan Store reducer
 */
export const currentPlanReducer = createReducer(currentPlanInitialState, ...currentPlanReducerFeatures);
