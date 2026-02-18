import { createFeatureSelector } from '@ngrx/store';
import { COMPLEX_FLIGHT_CALENDAR_STORE_NAME, ComplexFlightCalendarState } from './complex-flight-calendar.state';

/** Select ComplexFlightCalendar State */
export const selectComplexFlightCalendarState = createFeatureSelector<ComplexFlightCalendarState>(
  COMPLEX_FLIGHT_CALENDAR_STORE_NAME
);
