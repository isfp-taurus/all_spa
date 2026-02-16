import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  ORDERS_RESERVATION_AVAILABILITY_STORE_NAME,
  OrdersReservationAvailabilityState,
} from './orders-reservation-availability.state';

/** Select OrdersReservationAvailability State */
export const selectOrdersReservationAvailabilityState = createFeatureSelector<OrdersReservationAvailabilityState>(
  ORDERS_RESERVATION_AVAILABILITY_STORE_NAME
);

/** Select OrdersReservationAvailability isPending status */
export const selectOrdersReservationAvailabilityIsPendingStatus = createSelector(
  selectOrdersReservationAvailabilityState,
  (state) => !!state.isPending
);

/** Select OrdersReservationAvailability isFailure status */
export const selectOrdersReservationAvailabilityIsFailureStatus = createSelector(
  selectOrdersReservationAvailabilityState,
  (state) => !!state.isFailure
);
