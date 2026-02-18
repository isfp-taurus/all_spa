import { MyBookingServiceStoreModel, MyBookingStoreModel } from '@common/interfaces';

/**
 * MyBooking model
 */
export interface MyBookingModel {
  myBooking?: MyBookingStoreModel;
  myBookingService?: MyBookingServiceStoreModel;
}

/**
 * MyBookingResponse model details
 */
export interface MyBookingStateDetails extends MyBookingModel {}

/**
 * MyBooking store state
 */
export interface MyBookingState extends MyBookingStateDetails, MyBookingModel {}

/**
 * Name of the MyBooking Store
 */
export const MY_BOOKING_STORE_NAME = 'myBooking';

/**
 * MyBooking Store Interface
 */
export interface MyBookingStore {
  /** MyBooking state */
  [MY_BOOKING_STORE_NAME]: MyBookingState;
}
