import { createAction, props } from '@ngrx/store';
import { AswCommonState } from './asw-common.state';

/** StateDetailsActions */
const ACTION_SET = '[AswCommon] set';
const ACTION_UPDATE = '[AswCommon] update';
const ACTION_RESET = '[AswCommon] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const setAswCommon = createAction(ACTION_SET, props<AswCommonState>());

/**
 * Change a part or the whole object in the store.
 */
export const updateAswCommon = createAction(ACTION_UPDATE, props<Partial<AswCommonState>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetAswCommon = createAction(ACTION_RESET);
