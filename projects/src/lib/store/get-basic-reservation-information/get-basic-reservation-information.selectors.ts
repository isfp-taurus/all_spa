import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  GET_BASIC_RESERVATION_INFORMATION_STORE_NAME,
  GetBasicReservationInformationState,
} from './get-basic-reservation-information.state';

/** Select GetBasicReservationInformation State */
export const selectGetBasicReservationInformationState = createFeatureSelector<GetBasicReservationInformationState>(
  GET_BASIC_RESERVATION_INFORMATION_STORE_NAME
);

/** Select GetBasicReservationInformation isPending status */
export const selectGetBasicReservationInformationIsPendingStatus = createSelector(
  selectGetBasicReservationInformationState,
  (state) => !!state.isPending
);

/** Select GetBasicReservationInformation isFailure status */
export const selectGetBasicReservationInformationIsFailureStatus = createSelector(
  selectGetBasicReservationInformationState,
  (state) => !!state.isFailure
);
