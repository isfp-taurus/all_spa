import { createFeatureSelector } from '@ngrx/store';
import {
  ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_STORE_NAME,
  RoundtripFlightAvailabilityInternationalModel,
} from './roundtrip-flight-availability-international.state';

/** Select RoundtripFlightAvailabilityInternational State */
export const selectRoundtripFlightAvailabilityInternationalState =
  createFeatureSelector<RoundtripFlightAvailabilityInternationalModel>(
    ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_STORE_NAME
  );
