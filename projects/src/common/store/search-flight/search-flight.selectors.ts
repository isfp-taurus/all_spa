import { createFeatureSelector } from '@ngrx/store';
import { SEARCH_FLIGHT_STORE_NAME, SearchFlightState } from './search-flight.state';

/** Select SearchFlight State */
export const selectSearchFlightState = createFeatureSelector<SearchFlightState>(SEARCH_FLIGHT_STORE_NAME);
