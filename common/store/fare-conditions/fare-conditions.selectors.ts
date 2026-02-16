import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FARE_CONDITIONS_STORE_NAME, FareConditionsState } from './fare-conditions.state';

/** Select FareConditions State */
export const selectFareConditionsState = createFeatureSelector<FareConditionsState>(FARE_CONDITIONS_STORE_NAME);

/** Select FareConditions isPending status */
export const selectFareConditionsIsPendingStatus = createSelector(
  selectFareConditionsState,
  (state) => !!state.isPending
);

/** Select FareConditions isFailure status */
export const selectFareConditionsIsFailureStatus = createSelector(
  selectFareConditionsState,
  (state) => !!state.isFailure
);
