import { createAction, props } from '@ngrx/store';
import { AMCMemberState } from './amc-member.state';

/** StateDetailsActions */
const ACTION_SET = '[AMCMember] set';
const ACTION_UPDATE = '[AMCMember] update';
const ACTION_RESET = '[AMCMember] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const setAMCMember = createAction(ACTION_SET, props<AMCMemberState>());

/**
 * Change a part or the whole object in the store.
 */
export const updateAMCMember = createAction(ACTION_UPDATE, props<Partial<AMCMemberState>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetAMCMember = createAction(ACTION_RESET);
