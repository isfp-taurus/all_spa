import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ROUNDTRIP_OWD_DISPLAY_STORE_NAME, RoundtripOwdDisplayState } from './roundtrip-owd-display.state';

/** Select RoundtripOwdDisplay State */
export const selectRoundtripOwdDisplayState = createFeatureSelector<RoundtripOwdDisplayState>(
  ROUNDTRIP_OWD_DISPLAY_STORE_NAME
);

/** Select RoundtripOwdDisplay isPending status */
export const selectRoundtripOwdDisplayIsPendingStatus = createSelector(
  selectRoundtripOwdDisplayState,
  (state) => !!state.isPending
);

/** Select RoundtripOwdDisplay isFailure status */
export const selectRoundtripOwdDisplayIsFailureStatus = createSelector(
  selectRoundtripOwdDisplayState,
  (state) => !!state.isFailure
);
