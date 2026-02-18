import { createFeatureSelector } from '@ngrx/store';
import {
  ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_STORE_NAME,
  RoundtripFlightAvailabilityInternationalState,
} from './roundtripFlightAvailabilityInternational.state';

/** Select RoundtripFlightAvailabilityInternational State */
export const selectRoundtripFlightAvailabilityInternationalState =
  createFeatureSelector<RoundtripFlightAvailabilityInternationalState>(
    ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_STORE_NAME
  );
