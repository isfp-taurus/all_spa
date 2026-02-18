import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UPDATE_TRAVELERS_STORE_NAME, UpdateTravelersState } from './update-travelers.state';

/** Select UpdateTravelers State */
export const selectUpdateTravelersState = createFeatureSelector<UpdateTravelersState>(UPDATE_TRAVELERS_STORE_NAME);

/** Select UpdateTravelers isPending status */
export const selectUpdateTravelersIsPendingStatus = createSelector(
  selectUpdateTravelersState,
  (state) => !!state.isPending
);

/** Select UpdateTravelers isFailure status */
export const selectUpdateTravelersIsFailureStatus = createSelector(
  selectUpdateTravelersState,
  (state) => !!state.isFailure
);
