import { AsyncStoreItem } from '@lib/store';
import { RoundtripOwdResponse } from 'src/sdk-search';

/**
 * RoundtripOwd model
 */
export interface RoundtripFlightAvailabilityInternationalModel {}
export interface RoundtripOwdModel extends RoundtripOwdResponse {}

/**
 * RoundtripFlightAvailabilityInternational model details
 */
export interface RoundtripFlightAvailabilityInternationalStateDetails extends AsyncStoreItem {}

/**
 * RoundtripFlightAvailabilityInternational store state
 */
export interface RoundtripFlightAvailabilityInternationalModel
  extends RoundtripFlightAvailabilityInternationalStateDetails,
    RoundtripOwdModel {}

/**
 * Name of the RoundtripFlightAvailabilityInternational Store
 */
export const ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_STORE_NAME = 'roundtripFlightAvailabilityInternational';

/**
 * RoundtripFlightAvailabilityInternational Store Interface
 */
export interface RoundtripFlightAvailabilityInternationalStore {
  /** RoundtripFlightAvailabilityInternational state */
  [ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_STORE_NAME]: RoundtripFlightAvailabilityInternationalModel;
}
