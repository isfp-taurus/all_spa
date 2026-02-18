import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  SEARCH_FLIGHT_CONDITION_FOR_REQUEST_STORE_NAME,
  SearchFlightConditionForRequestState,
} from './search-flight-condition-for-request.state';

/** Select SearchFlightConditionForRequest State */
export const selectSearchFlightConditionForRequestState = createFeatureSelector<SearchFlightConditionForRequestState>(
  SEARCH_FLIGHT_CONDITION_FOR_REQUEST_STORE_NAME
);

/** Select SearchFlightConditionForRequest isPending status */
export const selectSearchFlightConditionForRequestIsPendingStatus = createSelector(
  selectSearchFlightConditionForRequestState,
  (state) => !!state.isPending
);

/** Select SearchFlightConditionForRequest isFailure status */
export const selectSearchFlightConditionForRequestIsFailureStatus = createSelector(
  selectSearchFlightConditionForRequestState,
  (state) => !!state.isFailure
);
