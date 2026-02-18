import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UPGRADE_AVAILABILITY_STORE_NAME, UpgradeAvailabilityState } from './upgrade-availability.state';

/** Select UpgradeAvailability State */
export const selectUpgradeAvailabilityState = createFeatureSelector<UpgradeAvailabilityState>(
  UPGRADE_AVAILABILITY_STORE_NAME
);

/** Select UpgradeAvailability isPending status */
export const selectUpgradeAvailabilityIsPendingStatus = createSelector(
  selectUpgradeAvailabilityState,
  (state) => !!state.isPending
);

/** Select UpgradeAvailability isFailure status */
export const selectUpgradeAvailabilityIsFailureStatus = createSelector(
  selectUpgradeAvailabilityState,
  (state) => !!state.isFailure
);
