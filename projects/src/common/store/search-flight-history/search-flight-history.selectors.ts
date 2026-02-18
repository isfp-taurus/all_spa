import { createFeatureSelector } from '@ngrx/store';
import { SEARCH_FLIGHT_HISTORY_STORE_NAME, SearchFlightHistoryState } from './search-flight-history.state';

/** Select SearchFlightHistory State */
export const selectSearchFlightHistoryState = createFeatureSelector<SearchFlightHistoryState>(
  SEARCH_FLIGHT_HISTORY_STORE_NAME
);
