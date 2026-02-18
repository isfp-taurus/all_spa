import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PLAN_REVIEW_STORE_NAME, PlanReviewState } from './plan-review.state';

/** Select PlanReview State */
export const selectPlanReviewState = createFeatureSelector<PlanReviewState>(PLAN_REVIEW_STORE_NAME);

/** Select PlanReview isPending status */
export const selectPlanReviewIsPendingStatus = createSelector(selectPlanReviewState, (state) => !!state.isPending);

/** Select PlanReview isFailure status */
export const selectPlanReviewIsFailureStatus = createSelector(selectPlanReviewState, (state) => !!state.isFailure);
