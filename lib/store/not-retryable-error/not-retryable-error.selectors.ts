import { createFeatureSelector, createSelector } from '@ngrx/store';
import { NOT_RETRYABLE_ERROR_STORE_NAME, NotRetryableErrorState } from './not-retryable-error.state';

/** Select NotRetryableError State */
export const selectNotRetryableErrorState =
  createFeatureSelector<NotRetryableErrorState>(NOT_RETRYABLE_ERROR_STORE_NAME);

export const selectNotRetryableError = createSelector(selectNotRetryableErrorState, (state) => state.model);
