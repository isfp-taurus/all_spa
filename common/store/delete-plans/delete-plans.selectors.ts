import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DELETE_PLANS_STORE_NAME, DeletePlansState } from './delete-plans.state';

/** Select DeletePlans State */
export const selectDeletePlansState = createFeatureSelector<DeletePlansState>(DELETE_PLANS_STORE_NAME);

/** Select DeletePlans isPending status */
export const selectDeletePlansIsPendingStatus = createSelector(selectDeletePlansState, (state) => !!state.isPending);

/** Select DeletePlans isFailure status */
export const selectDeletePlansIsFailureStatus = createSelector(selectDeletePlansState, (state) => !!state.isFailure);
