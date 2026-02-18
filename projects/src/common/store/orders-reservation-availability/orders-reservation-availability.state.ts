import { AsyncStoreItem } from '@lib/store';
import { ReservationAvailabilityResponse } from 'src/sdk-member';

/**
 * OrdersReservationAvailability model
 */
export interface OrdersReservationAvailabilityModel {
  model: ReservationAvailabilityResponse | null;
}

/**
 * ReservationAvailabilityResponse model details
 */
export interface OrdersReservationAvailabilityStateDetails extends AsyncStoreItem {}

/**
 * OrdersReservationAvailability store state
 */
export interface OrdersReservationAvailabilityState
  extends OrdersReservationAvailabilityStateDetails,
    OrdersReservationAvailabilityModel {}

/**
 * Name of the OrdersReservationAvailability Store
 */
export const ORDERS_RESERVATION_AVAILABILITY_STORE_NAME = 'ordersReservationAvailability';

/**
 * OrdersReservationAvailability Store Interface
 */
export interface OrdersReservationAvailabilityStore {
  /** OrdersReservationAvailability state */
  [ORDERS_RESERVATION_AVAILABILITY_STORE_NAME]: OrdersReservationAvailabilityState;
}
