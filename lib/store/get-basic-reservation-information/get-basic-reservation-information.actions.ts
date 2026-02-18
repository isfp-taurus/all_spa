import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '../common';
import { GetBasicReservationInformationModel } from './get-basic-reservation-information.state';

/** StateDetailsActions */
const ACTION_SET = '[GetBasicReservationInformation] set';
const ACTION_UPDATE = '[GetBasicReservationInformation] update';
const ACTION_RESET = '[GetBasicReservationInformation] reset';
const ACTION_FAIL = '[GetBasicReservationInformation] fail';
const ACTION_CANCEL_REQUEST = '[GetBasicReservationInformation] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[GetBasicReservationInformation] set from api';
const ACTION_UPDATE_FROM_API = '[GetBasicReservationInformation] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setGetBasicReservationInformation = createAction(
  ACTION_SET,
  props<WithRequestId<GetBasicReservationInformationModel>>()
);

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateGetBasicReservationInformation = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<GetBasicReservationInformationModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetGetBasicReservationInformation = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelGetBasicReservationInformationRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failGetBasicReservationInformation = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setGetBasicReservationInformationFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<GetBasicReservationInformationModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateGetBasicReservationInformationFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<GetBasicReservationInformationModel>>()
);
