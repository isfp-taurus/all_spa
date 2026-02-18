import { createFeatureSelector } from '@ngrx/store';
import { MY_BOOKING_STORE_NAME, MyBookingState } from './mybooking.state';

/** Select MyBooking State */
export const selectMyBookingState = createFeatureSelector<MyBookingState>(MY_BOOKING_STORE_NAME);
