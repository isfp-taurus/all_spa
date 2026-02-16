import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './complex-flight-calendar.actions';
import { ComplexFlightCalendarState } from './complex-flight-calendar.state';

/**
 * ComplexFlightCalendar initial state
 */
export const ComplexFlightCalendarInitialState: ComplexFlightCalendarState = {
  // empty init
  previousId: '',
};

/**
 * List of basic actions for ComplexFlightCalendar Store
 */
export const ComplexFlightCalendarReducerFeatures: ReducerTypes<ComplexFlightCalendarState, ActionCreator[]>[] = [
  on(actions.setComplexFlightCalendar, (payload) => ({ ...payload })),

  on(actions.updateComplexFlightCalendar, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetComplexFlightCalendar, () => ComplexFlightCalendarInitialState),
];

/**
 * ComplexFlightCalendar Store reducer
 */
export const ComplexFlightCalendarReducer = createReducer(
  ComplexFlightCalendarInitialState,
  ...ComplexFlightCalendarReducerFeatures
);
