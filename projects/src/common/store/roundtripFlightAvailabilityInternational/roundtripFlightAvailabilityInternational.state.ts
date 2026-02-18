import { RoundtripFlightAvailabilityInternationalStoreModel } from '@common/interfaces';

/**
 * RoundtripFlightAvailabilityInternational model
 */
export interface RoundtripFlightAvailabilityInternationalModel
  extends RoundtripFlightAvailabilityInternationalStoreModel {}

/**
 * RoundtripFlightAvailabilityInternationalResponse model details
 */
export interface RoundtripFlightAvailabilityInternationalStateDetails
  extends RoundtripFlightAvailabilityInternationalModel {}

/**
 * RoundtripFlightAvailabilityInternational store state
 */
export interface RoundtripFlightAvailabilityInternationalState
  extends RoundtripFlightAvailabilityInternationalStateDetails,
    RoundtripFlightAvailabilityInternationalModel {}

/**
 * Name of the RoundtripFlightAvailabilityInternational Store
 */
export const ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_STORE_NAME = 'roundtripFlightAvailabilityInternational';

/**
 * RoundtripFlightAvailabilityInternational Store Interface
 */
export interface RoundtripFlightAvailabilityInternationalStore {
  /** RoundtripFlightAvailabilityInternational state */
  [ROUNDTRIP_FLIGHT_AVAILABILITY_INTERNATIONAL_STORE_NAME]: RoundtripFlightAvailabilityInternationalState;
}
