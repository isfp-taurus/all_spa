import { createAction, props } from '@ngrx/store';
import { WaitlistModel } from './waitlist.state';
import { AsyncRequest, FromApiActionPayload, WithRequestId, asyncProps } from '@lib/store';
import { WaitlistGetSearchWaitlistResponse } from '@app/roundtrip-flight-availability-domestic/common/sdk';

/** StateDetailsActions */
const ACTION_SET = '[Waitlist] set';
const ACTION_UPDATE = '[Waitlist] update';
const ACTION_RESET = '[Waitlist] reset';
const ACTION_FAIL = '[Waitlist] fail';
const ACTION_CANCEL_REQUEST = '[Waitlist] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[Waitlist] set from api';
const ACTION_UPDATE_FROM_API = '[Waitlist] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setWaitlist = createAction(ACTION_SET, props<WithRequestId<WaitlistModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateWaitlist = createAction(ACTION_UPDATE, props<WithRequestId<Partial<WaitlistModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetWaitlist = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelWaitlistRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failWaitlist = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setWaitlistFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<WaitlistGetSearchWaitlistResponse>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateWaitlistFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<WaitlistGetSearchWaitlistResponse>>()
);
