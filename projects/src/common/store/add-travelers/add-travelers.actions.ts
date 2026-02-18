import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { AddTravelersModel } from './add-travelers.state';

/** StateDetailsActions */
const ACTION_SET = '[AddTravelers] set';
const ACTION_UPDATE = '[AddTravelers] update';
const ACTION_RESET = '[AddTravelers] reset';
const ACTION_FAIL = '[AddTravelers] fail';
const ACTION_CANCEL_REQUEST = '[AddTravelers] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[AddTravelers] set from api';
const ACTION_UPDATE_FROM_API = '[AddTravelers] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setAddTravelers = createAction(ACTION_SET, props<WithRequestId<AddTravelersModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateAddTravelers = createAction(ACTION_UPDATE, props<WithRequestId<Partial<AddTravelersModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetAddTravelers = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelAddTravelersRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failAddTravelers = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setAddTravelersFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<AddTravelersModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateAddTravelersFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<AddTravelersModel>>()
);
