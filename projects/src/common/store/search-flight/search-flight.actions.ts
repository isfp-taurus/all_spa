import { createAction, props } from '@ngrx/store';
import { SearchFlightState } from './search-flight.state';

/** StateDetailsActions */
const ACTION_SET = '[SearchFlight] set';
const ACTION_UPDATE = '[SearchFlight] update';
const ACTION_RESET = '[SearchFlight] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const setSearchFlight = createAction(ACTION_SET, props<SearchFlightState>());

/**
 * Change a part or the whole object in the store.
 */
export const updateSearchFlight = createAction(ACTION_UPDATE, props<Partial<SearchFlightState>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetSearchFlight = createAction(ACTION_RESET);
