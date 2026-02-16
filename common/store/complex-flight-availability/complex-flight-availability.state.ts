import { ComplexFlightAvailabilityStoreModel } from '@common/interfaces';
/**
 * ComplexFlightAvailability model
 */
export interface ComplexFlightAvailabilityModel extends ComplexFlightAvailabilityStoreModel {}

/**
 *  model details
 */
export interface ComplexFlightAvailabilityStateDetails extends ComplexFlightAvailabilityModel {}

/**
 * ComplexFlightAvailability store state
 */
export interface ComplexFlightAvailabilityState extends ComplexFlightAvailabilityStateDetails {}

/**
 * Name of the ComplexFlightAvailability Store
 */
export const COMPLEX_FLIGHT_AVAILABILITY_STORE_NAME = 'ComplexFlightAvailability';

/**
 * ComplexFlightAvailability Store Interface
 */
export interface ComplexFlightAvailabilityStore {
  /** ComplexFlightAvailability state */
  [COMPLEX_FLIGHT_AVAILABILITY_STORE_NAME]: ComplexFlightAvailabilityState;
}
