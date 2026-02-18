import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './plan-list.actions';
import { PlanListState } from './plan-list.state';

/**
 * planList initial state
 */
export const planListInitialState: PlanListState = {
  requestIds: [],
  planList: [],
  isNeedRefresh: false,
  isChangePlanList: false,
  isPlanMerge: false,
  isReInit: false,
  finishLoading: false,
};

/**
 * List of basic actions for PlanList Store
 */
export const planListReducerFeatures: ReducerTypes<PlanListState, ActionCreator[]>[] = [
  on(actions.setPlanList, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updatePlanList, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetPlanList, () => planListInitialState),

  on(actions.cancelPlanListRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failPlanList, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setPlanListFromApi, actions.updatePlanListFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * PlanList Store reducer
 */
export const planListReducer = createReducer(planListInitialState, ...planListReducerFeatures);
