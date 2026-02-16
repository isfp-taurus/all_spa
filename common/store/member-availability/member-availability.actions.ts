import { MemberAvailabilityResponse } from 'src/sdk-member';
import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { MemberAvailabilityModel } from './member-availability.state';

/** StateDetailsActions */
const ACTION_SET = '[MemberAvailability] set';
const ACTION_UPDATE = '[MemberAvailability] update';
const ACTION_RESET = '[MemberAvailability] reset';
const ACTION_FAIL = '[MemberAvailability] fail';
const ACTION_CANCEL_REQUEST = '[MemberAvailability] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[MemberAvailability] set from api';
const ACTION_UPDATE_FROM_API = '[MemberAvailability] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setMemberAvailability = createAction(ACTION_SET, props<WithRequestId<MemberAvailabilityModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateMemberAvailability = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<MemberAvailabilityModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetMemberAvailability = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelMemberAvailabilityRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failMemberAvailability = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setMemberAvailabilityFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<MemberAvailabilityResponse>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateMemberAvailabilityFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<MemberAvailabilityResponse>>()
);
