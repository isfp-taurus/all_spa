import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './booking-completed-sub-header-information.actions';
import { BookingCompletedSubHeaderInformationState } from './booking-completed-sub-header-information.state';

/**
 * bookingCompletedSubHeaderInformation initial state
 */
export const bookingCompletedSubHeaderInformationInitialState: BookingCompletedSubHeaderInformationState = {
  displayTitle: 'label.purchaseComplete1',
  isBreadcrumbDisplay: false,
};

/**
 * List of basic actions for BookingCompletedSubHeaderInformation Store
 */
export const bookingCompletedSubHeaderInformationReducerFeatures: ReducerTypes<
  BookingCompletedSubHeaderInformationState,
  ActionCreator[]
>[] = [
  on(actions.setBookingCompletedSubHeaderInformation, (state, payload) => ({ ...payload })),

  on(actions.updateBookingCompletedSubHeaderInformation, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetBookingCompletedSubHeaderInformation, () => bookingCompletedSubHeaderInformationInitialState),
];

/**
 * BookingCompletedSubHeaderInformation Store reducer
 */
export const bookingCompletedSubHeaderInformationReducer = createReducer(
  bookingCompletedSubHeaderInformationInitialState,
  ...bookingCompletedSubHeaderInformationReducerFeatures
);
