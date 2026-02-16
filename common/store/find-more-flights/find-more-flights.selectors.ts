import { createFeatureSelector } from '@ngrx/store';
import { FIND_MORE_FLIGHTS_STORE_NAME, FindMoreFlightsState } from './find-more-flights.state';

/** Select FindMoreFlights State */
export const selectFindMoreFlightsState = createFeatureSelector<FindMoreFlightsState>(FIND_MORE_FLIGHTS_STORE_NAME);
