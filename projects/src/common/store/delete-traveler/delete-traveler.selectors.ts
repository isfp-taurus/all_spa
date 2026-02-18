import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DELETE_TRAVELER_STORE_NAME, DeleteTravelerState } from './delete-traveler.state';

/** Select DeleteTraveler State */
export const selectDeleteTravelerState = createFeatureSelector<DeleteTravelerState>(DELETE_TRAVELER_STORE_NAME);

/** Select DeleteTraveler isPending status */
export const selectDeleteTravelerIsPendingStatus = createSelector(
  selectDeleteTravelerState,
  (state) => !!state.isPending
);

/** Select DeleteTraveler isFailure status */
export const selectDeleteTravelerIsFailureStatus = createSelector(
  selectDeleteTravelerState,
  (state) => !!state.isFailure
);
