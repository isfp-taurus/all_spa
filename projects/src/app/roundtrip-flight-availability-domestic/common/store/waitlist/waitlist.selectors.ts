import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WAITLIST_STORE_NAME, WaitlistState } from './waitlist.state';

/** Select Waitlist State */
export const selectWaitlistState = createFeatureSelector<WaitlistState>(WAITLIST_STORE_NAME);

/** Select Waitlist isPending status */
export const selectWaitlistIsPendingStatus = createSelector(selectWaitlistState, (state) => !!state.isPending);

/** Select Waitlist isFailure status */
export const selectWaitlistIsFailureStatus = createSelector(selectWaitlistState, (state) => !!state.isFailure);

export const selectWaitlist = createSelector(selectWaitlistState, (state) => state.model);
