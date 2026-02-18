import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './find-more-flights.actions';
import { FindMoreFlightsState } from './find-more-flights.state';

/**
 * FindMoreFlights initial state
 */
export const FindMoreFlightsInitialState: FindMoreFlightsState = {};

/**
 * List of basic actions for FindMoreFlights Store
 */
export const FindMoreFlightsReducerFeatures: ReducerTypes<FindMoreFlightsState, ActionCreator[]>[] = [
  on(actions.setFindMoreFlights, (payload) => ({ ...payload })),

  on(actions.updateFindMoreFlights, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetFindMoreFlights, () => FindMoreFlightsInitialState),
];

/**
 * FindMoreFlights Store reducer
 */
export const FindMoreFlightsReducer = createReducer(FindMoreFlightsInitialState, ...FindMoreFlightsReducerFeatures);
