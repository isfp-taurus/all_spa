import { createAction, props } from '@ngrx/store';
import { ApiErrorResponseState } from './api-error-response.state';
import { ApiErrorResponseModel } from '../../interfaces';

/** StateDetailsActions */
const ACTION_SET = '[ApiErrorResponse] set';
const ACTION_UPDATE = '[ApiErrorResponse] update';
const ACTION_RESET = '[ApiErrorResponse] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const setApiErrorResponse = createAction(ACTION_SET, props<ApiErrorResponseModel>());

/**
 * Change a part or the whole object in the store.
 */
export const updateApiErrorResponse = createAction(ACTION_UPDATE, props<Partial<ApiErrorResponseModel>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetApiErrorResponse = createAction(ACTION_RESET);
