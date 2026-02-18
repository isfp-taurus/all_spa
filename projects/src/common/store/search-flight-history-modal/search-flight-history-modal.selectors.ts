import { createFeatureSelector } from '@ngrx/store';
import {
  SEARCH_FLIGHT_HISTORY_MODAL_STORE_NAME,
  SearchFlightHistoryModalState,
} from './search-flight-history-modal.state';

/** Select SearchFlightHistoryModal State */
export const selectSearchFlightHistoryModalState = createFeatureSelector<SearchFlightHistoryModalState>(
  SEARCH_FLIGHT_HISTORY_MODAL_STORE_NAME
);
