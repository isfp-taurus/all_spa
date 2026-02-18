import { createAction, props } from '@ngrx/store';
import { AswMasterState } from './asw-master.state';

/** StateDetailsActions */
const ACTION_SET = '[AswMaster] set';
const ACTION_UPDATE = '[AswMaster] update';
const ACTION_RESET = '[AswMaster] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const setAswMaster = createAction(ACTION_SET, props<AswMasterState>());

/**
 * Change a part or the whole object in the store.
 */
export const updateAswMaster = createAction(ACTION_UPDATE, props<Partial<AswMasterState>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetAswMaster = createAction(ACTION_RESET);
