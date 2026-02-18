import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './search-flight-history.actions';
import { SearchFlightHistoryState } from './search-flight-history.state';

/**
 * SearchFlightHistory initial state
 */
export const SearchFlightHistoryInitialState: SearchFlightHistoryState = {
  apiRequestState: 'unexecuted',
  warnings: [],
  histories: [],
  favorite: [],
};

/**
 * List of basic actions for SearchFlightHistory Store
 */
export const SearchFlightHistoryReducerFeatures: ReducerTypes<SearchFlightHistoryState, ActionCreator[]>[] = [
  on(actions.setSearchFlightHistory, (_state, payload) => ({ ...payload })),

  on(actions.updateSearchFlightHistory, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetSearchFlightHistory, () => SearchFlightHistoryInitialState),
];

/**
 * SearchFlightHistory Store reducer
 */
export const SearchFlightHistoryReducer = createReducer(
  SearchFlightHistoryInitialState,
  ...SearchFlightHistoryReducerFeatures
);
