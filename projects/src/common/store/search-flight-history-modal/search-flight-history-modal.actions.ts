import { createAction, props } from '@ngrx/store';
import { SearchFlightHistoryModalState } from './search-flight-history-modal.state';

/** StateDetailsActions */
const ACTION_SET = '[SearchFlightHistoryModal] set';
const ACTION_UPDATE = '[SearchFlightHistoryModal] update';
const ACTION_RESET = '[SearchFlightHistoryModal] reset';
/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setSearchFlightHistoryModal = createAction(ACTION_SET, props<SearchFlightHistoryModalState>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateSearchFlightHistoryModal = createAction(
  ACTION_UPDATE,
  props<Partial<SearchFlightHistoryModalState>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetSearchFlightHistoryModal = createAction(ACTION_RESET);
