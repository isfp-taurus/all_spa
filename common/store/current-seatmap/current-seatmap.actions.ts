import { createAction, props } from '@ngrx/store';
import { CurrentSeatmapState } from './current-seatmap.state';

/** StateDetailsActions */
const ACTION_SET = '[CurrentSeatmap] set';
const ACTION_UPDATE = '[CurrentSeatmap] update';
const ACTION_RESET = '[CurrentSeatmap] reset';
const ACTION_RETRIEVE = '[CurrentSeatmap] retrieve';
const ACTION_PRESERVE = '[CurrentSeatmap] preserve';

/**
 * Clear the current store object and replace it with the new one
 */
export const setCurrentSeatmap = createAction(ACTION_SET, props<CurrentSeatmapState>());

/**
 * Change a part or the whole object in the store.
 */
export const updateCurrentSeatmap = createAction(ACTION_UPDATE, props<Partial<CurrentSeatmapState>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetCurrentSeatmap = createAction(ACTION_RESET);

/**
 * Retrieve state from retrieve field
 */
export const retrieveCurrentSeatmap = createAction(ACTION_RETRIEVE);

/**
 * preserve snapshot of a part of state
 */
export const preserveCurrentSeatmap = createAction(ACTION_PRESERVE);
