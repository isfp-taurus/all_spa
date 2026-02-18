import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './orders-reservation-availability.actions';
import { OrdersReservationAvailabilityState } from './orders-reservation-availability.state';

/**
 * ordersReservationAvailability initial state
 */
export const ordersReservationAvailabilityInitialState: OrdersReservationAvailabilityState = {
  model: null,
  requestIds: [],
};

/**
 * List of basic actions for OrdersReservationAvailability Store
 */
export const ordersReservationAvailabilityReducerFeatures: ReducerTypes<
  OrdersReservationAvailabilityState,
  ActionCreator[]
>[] = [
  on(actions.setOrdersReservationAvailability, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateOrdersReservationAvailability, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetOrdersReservationAvailability, () => ordersReservationAvailabilityInitialState),

  on(actions.cancelOrdersReservationAvailabilityRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failOrdersReservationAvailability, (state, payload) =>
    asyncStoreItemAdapter.failRequest(state, payload.requestId)
  ),

  on(
    actions.setOrdersReservationAvailabilityFromApi,
    actions.updateOrdersReservationAvailabilityFromApi,
    (state, payload) => asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * OrdersReservationAvailability Store reducer
 */
export const ordersReservationAvailabilityReducer = createReducer(
  ordersReservationAvailabilityInitialState,
  ...ordersReservationAvailabilityReducerFeatures
);
