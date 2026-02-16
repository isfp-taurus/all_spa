import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  BOOKING_COMPLETED_SUB_HEADER_INFORMATION_STORE_NAME,
  BookingCompletedSubHeaderInformationState,
} from './booking-completed-sub-header-information.state';

/** Select BookingCompletedSubHeaderInformation State */
export const selectBookingCompletedSubHeaderInformationState =
  createFeatureSelector<BookingCompletedSubHeaderInformationState>(BOOKING_COMPLETED_SUB_HEADER_INFORMATION_STORE_NAME);
