import { AswServiceModel } from '../../interfaces';

/**
 * AswService store state
 */
export interface AswServiceState extends AswServiceModel {}

/**
 * Name of the AswService Store
 */
export const ASW_SERVICE_STORE_NAME = 'aswService';

/**
 * AswService Store Interface
 */
export interface AswServiceStore {
  /** AswService state */
  [ASW_SERVICE_STORE_NAME]: AswServiceState;
}
