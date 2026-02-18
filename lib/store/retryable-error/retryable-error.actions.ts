import { createAction, props } from '@ngrx/store';
import { RetryableError } from '../../interfaces';

/** StateDetailsActions */
const ACTION_SET_PAGE = '[RetryableError] set page';
const ACTION_RESET_PAGE = '[RetryableError] reset page';

const ACTION_SET_SUBPAGE = '[RetryableError] set subPage';
const ACTION_RESET_SUBPAGE = '[RetryableError] reset subPage';

const ACTION_RESET_ALL = '[RetryableError] reset all';

/**
 * Clear the current store object and replace it with the new one
 */
export const setPageRetryableError = createAction(ACTION_SET_PAGE, props<RetryableError>());
export const setSubPageRetryableError = createAction(ACTION_SET_SUBPAGE, props<RetryableError>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetPageRetryableError = createAction(ACTION_RESET_PAGE);
export const resetSubPageRetryableError = createAction(ACTION_RESET_SUBPAGE);
export const resetAllRetryableError = createAction(ACTION_RESET_ALL);
