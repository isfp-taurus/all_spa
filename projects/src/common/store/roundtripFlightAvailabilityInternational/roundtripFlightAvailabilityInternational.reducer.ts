import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './roundtripFlightAvailabilityInternational.actions';
import { RoundtripFlightAvailabilityInternationalState } from './roundtripFlightAvailabilityInternational.state';

/**
 * RoundtripFlightAvailabilityInternational initial state
 */
export const roundtripFlightAvailabilityInternationalInitialState: RoundtripFlightAvailabilityInternationalState = {};

/**
 * List of basic actions for RoundtripFlightAvailabilityInternational Store
 */
export const roundtripFlightAvailabilityInternationalReducerFeatures: ReducerTypes<
  RoundtripFlightAvailabilityInternationalState,
  ActionCreator[]
>[] = [
  on(actions.setRoundtripFlightAvailabilityInternational, (state, payload) => ({ ...payload })),

  on(actions.updateRoundtripFlightAvailabilityInternational, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetRoundtripFlightAvailabilityInternational, () => roundtripFlightAvailabilityInternationalInitialState),
];

/**
 * RoundtripFlightAvailabilityInternational Store reducer
 */
export const roundtripFlightAvailabilityInternationalReducer = createReducer(
  roundtripFlightAvailabilityInternationalInitialState,
  ...roundtripFlightAvailabilityInternationalReducerFeatures
);
