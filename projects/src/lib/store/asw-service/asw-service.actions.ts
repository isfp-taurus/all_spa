import { createAction, props } from '@ngrx/store';
import { AswServiceState } from './asw-service.state';

/** StateDetailsActions */
const ACTION_SET = '[AswService] set';
const ACTION_UPDATE = '[AswService] update';
const ACTION_RESET = '[AswService] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const setAswService = createAction(ACTION_SET, props<AswServiceState>());

/**
 * Change a part or the whole object in the store.
 */
export const updateAswService = createAction(ACTION_UPDATE, props<Partial<AswServiceState>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetAswService = createAction(ACTION_RESET);
