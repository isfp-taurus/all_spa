import { createAction, props } from '@ngrx/store';
import { SupportInformationInputState } from './support-information-input.state';

/** StateDetailsActions */
const ACTION_SET = '[SupportInformationInput] set';
const ACTION_UPDATE = '[SupportInformationInput] update';
const ACTION_RESET = '[SupportInformationInput] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const setSupportInformationInput = createAction(ACTION_SET, props<SupportInformationInputState>());

/**
 * Change a part or the whole object in the store.
 */
export const updateSupportInformationInput = createAction(
  ACTION_UPDATE,
  props<Partial<SupportInformationInputState>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetSupportInformationInput = createAction(ACTION_RESET);
