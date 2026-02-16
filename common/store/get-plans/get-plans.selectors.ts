import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GET_PLANS_STORE_NAME, GetPlansState } from './get-plans.state';

/** Select GetPlans State */
export const selectGetPlansState = createFeatureSelector<GetPlansState>(GET_PLANS_STORE_NAME);

/** Select GetPlans isPending status */
export const selectGetPlansIsPendingStatus = createSelector(selectGetPlansState, (state) => !!state.isPending);

/** Select GetPlans isFailure status */
export const selectGetPlansIsFailureStatus = createSelector(selectGetPlansState, (state) => !!state.isFailure);
