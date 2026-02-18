import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { UpgradeWaitlistModel } from './upgrade-waitlist.state';

/** StateDetailsActions */
const ACTION_SET = '[UpgradeWaitlist] set';
const ACTION_UPDATE = '[UpgradeWaitlist] update';
const ACTION_RESET = '[UpgradeWaitlist] reset';
const ACTION_FAIL = '[UpgradeWaitlist] fail';
const ACTION_CANCEL_REQUEST = '[UpgradeWaitlist] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[UpgradeWaitlist] set from api';
const ACTION_UPDATE_FROM_API = '[UpgradeWaitlist] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setUpgradeWaitlist = createAction(ACTION_SET, props<WithRequestId<UpgradeWaitlistModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateUpgradeWaitlist = createAction(ACTION_UPDATE, props<WithRequestId<Partial<UpgradeWaitlistModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetUpgradeWaitlist = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelUpgradeWaitlistRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failUpgradeWaitlist = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setUpgradeWaitlistFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<UpgradeWaitlistModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateUpgradeWaitlistFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<UpgradeWaitlistModel>>()
);
