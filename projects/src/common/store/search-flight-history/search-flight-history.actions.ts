import { createAction, props } from '@ngrx/store';
import { SearchFlightHistoryState } from './search-flight-history.state';

/** StateDetailsActions */
const ACTION_SET = '[SearchFlightHistory] set';
const ACTION_UPDATE = '[SearchFlightHistory] update';
const ACTION_RESET = '[SearchFlightHistory] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const setSearchFlightHistory = createAction(ACTION_SET, props<SearchFlightHistoryState>());

/**
 * Change a part or the whole object in the store.
 */
export const updateSearchFlightHistory = createAction(ACTION_UPDATE, props<Partial<SearchFlightHistoryState>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetSearchFlightHistory = createAction(ACTION_RESET);
