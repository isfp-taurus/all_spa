import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ROUNDTRIP_OWD_STORE_NAME, RoundtripOwdState } from './roundtrip-owd.state';

/** Select RoundtripOwd State */
export const selectRoundtripOwdState = createFeatureSelector<RoundtripOwdState>(ROUNDTRIP_OWD_STORE_NAME);

/** Select RoundtripOwd isPending status */
export const selectRoundtripOwdIsPendingStatus = createSelector(selectRoundtripOwdState, (state) => !!state.isPending);

/** Select RoundtripOwd isFailure status */
export const selectRoundtripOwdIsFailureStatus = createSelector(selectRoundtripOwdState, (state) => !!state.isFailure);
