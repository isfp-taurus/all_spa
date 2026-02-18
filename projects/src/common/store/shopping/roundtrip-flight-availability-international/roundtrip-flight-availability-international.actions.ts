import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { RoundtripOwdModel } from './roundtrip-flight-availability-international.state';

/** StateDetailsActions */
const ACTION_SET = '[RoundtripFlightAvailabilityInternational] set';
const ACTION_UPDATE = '[RoundtripFlightAvailabilityInternational] update';
const ACTION_RESET = '[RoundtripFlightAvailabilityInternational] reset';

const ACTION_FAIL = '[RoundtripFlightAvailabilityInternational] fail';
const ACTION_CANCEL_REQUEST = '[RoundtripFlightAvailabilityInternational] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[RoundtripFlightAvailabilityInternational] set from api';
const ACTION_UPDATE_FROM_API = '[RoundtripFlightAvailabilityInternational] update from api';

/**
 * Clear the current store object and replace it with the new one
 */
export const setRoundtripFlightAvailabilityInternational = createAction(
  ACTION_SET,
  props<WithRequestId<RoundtripOwdModel>>()
);

/**
 * Change a part or the whole object in the store.
 */
export const updateRoundtripFlightAvailabilityInternational = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<RoundtripOwdModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetRoundtripFlightAvailabilityInternational = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelRoundtripFlightAvailabilityInternationalRequest = createAction(
  ACTION_CANCEL_REQUEST,
  props<AsyncRequest>()
);

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failRoundtripFlightAvailabilityInternational = createAction(
  ACTION_FAIL,
  props<WithRequestId<{ error: any }>>()
);

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setRoundtripFlightAvailabilityInternationalFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<RoundtripOwdModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateRoundtripFlightAvailabilityInternationalFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<RoundtripOwdModel>>()
);
