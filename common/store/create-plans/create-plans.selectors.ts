import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CREATE_PLANS_STORE_NAME, CreatePlansState } from './create-plans.state';

/** Select CreatePlans State */
export const selectCreatePlansState = createFeatureSelector<CreatePlansState>(CREATE_PLANS_STORE_NAME);

/** Select CreatePlans isPending status */
export const selectCreatePlansIsPendingStatus = createSelector(selectCreatePlansState, (state) => !!state.isPending);

/** Select CreatePlans isFailure status */
export const selectCreatePlansIsFailureStatus = createSelector(selectCreatePlansState, (state) => !!state.isFailure);
