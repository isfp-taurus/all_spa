import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CURRENT_PLAN_STORE_NAME, CurrentPlanState } from './current-plan.state';

/** Select CurrentPlan State */
export const selectCurrentPlanState = createFeatureSelector<CurrentPlanState>(CURRENT_PLAN_STORE_NAME);

/** Select CurrentPlan isPending status */
export const selectCurrentPlanIsPendingStatus = createSelector(selectCurrentPlanState, (state) => !!state.isPending);

/** Select CurrentPlan isFailure status */
export const selectCurrentPlanIsFailureStatus = createSelector(selectCurrentPlanState, (state) => !!state.isFailure);
