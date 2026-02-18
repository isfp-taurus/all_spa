import { AsyncStoreItem } from '@lib/store';
import { FareConditionsResponse } from 'src/sdk-servicing';

/**
 * FareConditions model
 */
export interface FareConditionsModel extends FareConditionsResponse {}

/**
 * FareConditionsResponse model details
 */
export interface FareConditionsStateDetails extends AsyncStoreItem, FareConditionsModel {}

/**
 * FareConditions store state
 */
export interface FareConditionsState extends FareConditionsStateDetails, FareConditionsModel {}

/**
 * Name of the FareConditions Store
 */
export const FARE_CONDITIONS_STORE_NAME = 'fareConditions';

/**
 * FareConditions Store Interface
 */
export interface FareConditionsStore {
  /** FareConditions state */
  [FARE_CONDITIONS_STORE_NAME]: FareConditionsState;
}
