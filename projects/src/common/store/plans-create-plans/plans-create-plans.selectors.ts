import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PLANS_CREATE_PLANS_STORE_NAME, PlansCreatePlansState } from './plans-create-plans.state';

/** Select PlansCreatePlans State */
export const selectPlansCreatePlansState = createFeatureSelector<PlansCreatePlansState>(PLANS_CREATE_PLANS_STORE_NAME);

/** Select PlansCreatePlans isPending status */
export const selectPlansCreatePlansIsPendingStatus = createSelector(
  selectPlansCreatePlansState,
  (state) => !!state.isPending
);

/** Select PlansCreatePlans isFailure status */
export const selectPlansCreatePlansIsFailureStatus = createSelector(
  selectPlansCreatePlansState,
  (state) => !!state.isFailure
);
