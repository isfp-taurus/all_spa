import { AsyncStoreItem } from '@lib/store';
import { UpgradeavailabilityResponse } from '@common/interfaces/shopping/upgrade-availability/upgradeavailabilityResponses';

/**
 * UpgradeAvailability model
 */
export interface UpgradeAvailabilityModel extends UpgradeavailabilityResponse {}

/**
 * Type6 model details
 */
export interface UpgradeAvailabilityStateDetails extends AsyncStoreItem, UpgradeAvailabilityModel {}

/**
 * UpgradeAvailability store state
 */
export interface UpgradeAvailabilityState extends UpgradeAvailabilityStateDetails, UpgradeAvailabilityModel {}

/**
 * Name of the UpgradeAvailability Store
 */
export const UPGRADE_AVAILABILITY_STORE_NAME = 'upgradeAvailability';

/**
 * UpgradeAvailability Store Interface
 */
export interface UpgradeAvailabilityStore {
  /** UpgradeAvailability state */
  [UPGRADE_AVAILABILITY_STORE_NAME]: UpgradeAvailabilityState;
}
