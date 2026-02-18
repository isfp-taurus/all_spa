import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PLAN_LIST_STORE_NAME as PLAN_LIST_STORE_NAME, PlanListState } from './plan-list.state';

/** Select PlanList State */
export const selectPlanListState = createFeatureSelector<PlanListState>(PLAN_LIST_STORE_NAME);

/** Select PlanList isPending status */
export const selectPlanListIsPendingStatus = createSelector(selectPlanListState, (state) => !!state.isPending);

/** Select PlanList isFailure status */
export const selectPlanListIsFailureStatus = createSelector(selectPlanListState, (state) => !!state.isFailure);
