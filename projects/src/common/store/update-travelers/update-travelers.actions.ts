import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { UpdateTravelersModel } from './update-travelers.state';

/** StateDetailsActions */
const ACTION_SET = '[UpdateTravelers] set';
const ACTION_UPDATE = '[UpdateTravelers] update';
const ACTION_RESET = '[UpdateTravelers] reset';
const ACTION_FAIL = '[UpdateTravelers] fail';
const ACTION_CANCEL_REQUEST = '[UpdateTravelers] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[UpdateTravelers] set from api';
const ACTION_UPDATE_FROM_API = '[UpdateTravelers] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setUpdateTravelers = createAction(ACTION_SET, props<WithRequestId<UpdateTravelersModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateUpdateTravelers = createAction(ACTION_UPDATE, props<WithRequestId<Partial<UpdateTravelersModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetUpdateTravelers = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelUpdateTravelersRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failUpdateTravelers = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setUpdateTravelersFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<UpdateTravelersModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateUpdateTravelersFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<UpdateTravelersModel>>()
);
