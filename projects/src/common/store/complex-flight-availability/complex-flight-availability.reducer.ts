import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './complex-flight-availability.actions';
import { ComplexFlightAvailabilityState } from './complex-flight-availability.state';
/**
 * ComplexFlightAvailability initial state
 */
export const ComplexFlightAvailabilityInitialState: ComplexFlightAvailabilityState = {};

/**
 * List of basic actions for ComplexFlightAvailability Store
 */
export const ComplexFlightAvailabilityReducerFeatures: ReducerTypes<ComplexFlightAvailabilityState, ActionCreator[]>[] =
  [
    on(actions.setComplexFlightAvailability, (payload) => ({ ...payload })),

    on(actions.updateComplexFlightAvailability, (state, payload) => ({ ...state, ...payload })),

    on(actions.resetComplexFlightAvailability, () => ComplexFlightAvailabilityInitialState),
  ];

/**
 * ComplexFlightAvailability Store reducer
 */
export const ComplexFlightAvailabilityReducer = createReducer(
  ComplexFlightAvailabilityInitialState,
  ...ComplexFlightAvailabilityReducerFeatures
);
