import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ADD_TRAVELERS_STORE_NAME, AddTravelersState } from './add-travelers.state';

/** Select AddTravelers State */
export const selectAddTravelersState = createFeatureSelector<AddTravelersState>(ADD_TRAVELERS_STORE_NAME);

/** Select AddTravelers isPending status */
export const selectAddTravelersIsPendingStatus = createSelector(selectAddTravelersState, (state) => !!state.isPending);

/** Select AddTravelers isFailure status */
export const selectAddTravelersIsFailureStatus = createSelector(selectAddTravelersState, (state) => !!state.isFailure);
