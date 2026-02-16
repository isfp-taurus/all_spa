import { createFeatureSelector } from '@ngrx/store';
import {
  COMPLEX_FLIGHT_AVAILABILITY_STORE_NAME,
  ComplexFlightAvailabilityState,
} from './complex-flight-availability.state';

/** Select ComplexFlightAvailability State */
export const selectComplexFlightAvailabilityState = createFeatureSelector<ComplexFlightAvailabilityState>(
  COMPLEX_FLIGHT_AVAILABILITY_STORE_NAME
);
