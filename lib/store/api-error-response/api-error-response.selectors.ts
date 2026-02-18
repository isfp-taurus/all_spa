import { createFeatureSelector, createSelector } from '@ngrx/store';
import { API_ERROR_RESPONSE_STORE_NAME, ApiErrorResponseState } from './api-error-response.state';

/** Select ApiErrorResponse State */
export const selectApiErrorResponseState = createFeatureSelector<ApiErrorResponseState>(API_ERROR_RESPONSE_STORE_NAME);

export const selectApiErrorResponse = createSelector(selectApiErrorResponseState, (state) => state.model);
