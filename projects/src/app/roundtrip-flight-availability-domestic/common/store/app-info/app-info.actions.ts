import { AppInfoModel } from '../../interfaces';
import { createAction, props } from '@ngrx/store';

/** StateDetailsActions */
const ACTION_SET = '[AppInfo] set';
const ACTION_UPDATE = '[AppInfo] update';
const ACTION_RESET = '[AppInfo] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const setAppInfo = createAction(ACTION_SET, props<AppInfoModel>());

/**
 * Change a part or the whole object in the store.
 */
export const updateAppInfo = createAction(ACTION_UPDATE, props<Partial<AppInfoModel>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetAppInfo = createAction(ACTION_RESET);
