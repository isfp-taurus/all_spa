import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RETRYABLE_ERROR_STORE_NAME, RetryableErrorState } from './retryable-error.state';

/** Select RetryableError State */
export const selectRetryableErrorState = createFeatureSelector<RetryableErrorState>(RETRYABLE_ERROR_STORE_NAME);

/** Select subpage's RetryableError State */
export const selectSubPageRetryableError = createSelector(selectRetryableErrorState, (state) => state.subPageInfo);

/** Select page's RetryableError State */
export const selectPageRetryableError = createSelector(selectRetryableErrorState, (state) => state.pageInfo);
