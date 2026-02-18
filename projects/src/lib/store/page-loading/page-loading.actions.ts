import { createAction, props } from '@ngrx/store';
import { PageLoadingState } from './page-loading.state';

/** StateDetailsActions */
const ACTION_SET = '[PageLoading] set';
const ACTION_UPDATE = '[PageLoading] update';
const ACTION_RESET = '[PageLoading] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const setPageLoading = createAction(ACTION_SET, props<PageLoadingState>());

/**
 * Change a part or the whole object in the store.
 */
export const updatePageLoading = createAction(ACTION_UPDATE, props<Partial<PageLoadingState>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetPageLoading = createAction(ACTION_RESET);
