import { ReservationAvailabilityResponse } from 'src/sdk-member';
import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { OrdersReservationAvailabilityModel } from './orders-reservation-availability.state';

/** StateDetailsActions */
const ACTION_SET = '[OrdersReservationAvailability] set';
const ACTION_UPDATE = '[OrdersReservationAvailability] update';
const ACTION_RESET = '[OrdersReservationAvailability] reset';
const ACTION_FAIL = '[OrdersReservationAvailability] fail';
const ACTION_CANCEL_REQUEST = '[OrdersReservationAvailability] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[OrdersReservationAvailability] set from api';
const ACTION_UPDATE_FROM_API = '[OrdersReservationAvailability] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setOrdersReservationAvailability = createAction(
  ACTION_SET,
  props<WithRequestId<OrdersReservationAvailabilityModel>>()
);

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateOrdersReservationAvailability = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<OrdersReservationAvailabilityModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetOrdersReservationAvailability = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelOrdersReservationAvailabilityRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failOrdersReservationAvailability = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setOrdersReservationAvailabilityFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<ReservationAvailabilityResponse>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateOrdersReservationAvailabilityFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<ReservationAvailabilityResponse>>()
);
