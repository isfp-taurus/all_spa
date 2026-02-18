import { createAction, props } from '@ngrx/store';
import { NotRetryableErrorModel } from '../../interfaces';

/** StateDetailsActions */
const ACTION_SET = '[NotRetryableError] set';
const ACTION_RESET = '[NotRetryableError] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const setNotRetryableError = createAction(ACTION_SET, props<NotRetryableErrorModel>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetNotRetryableError = createAction(ACTION_RESET);
