import { createAction, props } from '@ngrx/store';
import { WithRequestId } from '@lib/store';
import { ConfidentialModel } from './confidential.state';

/** StateDetailsActions */
const ACTION_SET = '[Confidential] set';
const ACTION_UPDATE = '[Confidential] update';
const ACTION_RESET = '[Confidential] reset';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setConfidential = createAction(ACTION_SET, props<WithRequestId<ConfidentialModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateConfidential = createAction(ACTION_UPDATE, props<WithRequestId<Partial<ConfidentialModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetConfidential = createAction(ACTION_RESET);
