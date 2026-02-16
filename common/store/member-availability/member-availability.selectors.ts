import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MEMBER_AVAILABILITY_STORE_NAME, MemberAvailabilityState } from './member-availability.state';

/** Select MemberAvailability State */
export const selectMemberAvailabilityState =
  createFeatureSelector<MemberAvailabilityState>(MEMBER_AVAILABILITY_STORE_NAME);

/** Select MemberAvailability isPending status */
export const selectMemberAvailabilityIsPendingStatus = createSelector(
  selectMemberAvailabilityState,
  (state) => !!state.isPending
);

/** Select MemberAvailability isFailure status */
export const selectMemberAvailabilityIsFailureStatus = createSelector(
  selectMemberAvailabilityState,
  (state) => !!state.isFailure
);
