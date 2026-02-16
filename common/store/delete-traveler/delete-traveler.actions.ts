import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { DeleteTravelerModel } from './delete-traveler.state';

/** StateDetailsActions */
const ACTION_SET = '[DeleteTraveler] set';
const ACTION_UPDATE = '[DeleteTraveler] update';
const ACTION_RESET = '[DeleteTraveler] reset';
const ACTION_FAIL = '[DeleteTraveler] fail';
const ACTION_CANCEL_REQUEST = '[DeleteTraveler] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[DeleteTraveler] set from api';
const ACTION_UPDATE_FROM_API = '[DeleteTraveler] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setDeleteTraveler = createAction(ACTION_SET, props<WithRequestId<DeleteTravelerModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateDeleteTraveler = createAction(ACTION_UPDATE, props<WithRequestId<Partial<DeleteTravelerModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetDeleteTraveler = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelDeleteTravelerRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failDeleteTraveler = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setDeleteTravelerFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<DeleteTravelerModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateDeleteTravelerFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<DeleteTravelerModel>>()
);
