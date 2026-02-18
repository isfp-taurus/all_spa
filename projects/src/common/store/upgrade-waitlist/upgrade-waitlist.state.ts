import { AsyncStoreItem } from '@lib/store';

/**
 * UpgradeWaitlist model
 */
export interface UpgradeWaitlistModel {}

/**
 * Type3 model details
 */
export interface UpgradeWaitlistStateDetails extends AsyncStoreItem, UpgradeWaitlistModel {}

/**
 * UpgradeWaitlist store state
 */
export interface UpgradeWaitlistState extends UpgradeWaitlistStateDetails, UpgradeWaitlistModel {}

/**
 * Name of the UpgradeWaitlist Store
 */
export const UPGRADE_WAITLIST_STORE_NAME = 'upgradeWaitlist';

/**
 * UpgradeWaitlist Store Interface
 */
export interface UpgradeWaitlistStore {
  /** UpgradeWaitlist state */
  [UPGRADE_WAITLIST_STORE_NAME]: UpgradeWaitlistState;
}
