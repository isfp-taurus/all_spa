import { createAction, props } from '@ngrx/store';
import { DynamicContent } from '../../interfaces';

/** StateDetailsActions */
const ACTION_SET_PAGE = '[DynamicContent] set page';
const ACTION_RESET_PAGE = '[DynamicContent] reset page';

const ACTION_SET_SUBPAGE = '[DynamicContent] set subPage';
const ACTION_RESET_SUBPAGE = '[DynamicContent] reset subPage';

const ACTION_RESET_ALL = '[DynamicContent] reset all';

/**
 * Clear the current store object and replace it with the new one
 */
export const setPageDynamicContent = createAction(ACTION_SET_PAGE, props<DynamicContent>());
export const setSubPageDynamicContent = createAction(ACTION_SET_SUBPAGE, props<DynamicContent>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetPageDynamicContent = createAction(ACTION_RESET_PAGE);
export const resetSubPageDynamicContent = createAction(ACTION_RESET_SUBPAGE);
export const resetAllDynamicContent = createAction(ACTION_RESET_ALL);
