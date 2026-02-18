import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ROUNDTRIP_FPP_STORE_NAME, RoundtripFppState } from './roundtrip-fpp.state';

/** Select RoundtripFpp State */
export const selectRoundtripFppState = createFeatureSelector<RoundtripFppState>(ROUNDTRIP_FPP_STORE_NAME);

/** Select RoundtripFpp isPending status */
export const selectRoundtripFppIsPendingStatus = createSelector(selectRoundtripFppState, (state) => !!state.isPending);

/** Select RoundtripFpp isFailure status */
export const selectRoundtripFppIsFailureStatus = createSelector(selectRoundtripFppState, (state) => !!state.isFailure);

/** Select selectRoundtripFpp */
export const selectRoundtripFpp = createSelector(selectRoundtripFppState, (state) => state.model);
