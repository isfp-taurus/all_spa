import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UPGRADE_WAITLIST_STORE_NAME, UpgradeWaitlistState } from './upgrade-waitlist.state';

/** Select UpgradeWaitlist State */
export const selectUpgradeWaitlistState = createFeatureSelector<UpgradeWaitlistState>(UPGRADE_WAITLIST_STORE_NAME);

/** Select UpgradeWaitlist isPending status */
export const selectUpgradeWaitlistIsPendingStatus = createSelector(
  selectUpgradeWaitlistState,
  (state) => !!state.isPending
);

/** Select UpgradeWaitlist isFailure status */
export const selectUpgradeWaitlistIsFailureStatus = createSelector(
  selectUpgradeWaitlistState,
  (state) => !!state.isFailure
);
