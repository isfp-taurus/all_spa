import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SEATMAPS_STATE, SeatmapsState } from './get-seatmaps.state';

// export const selectSeatmapsState = createFeatureSelector<SeatmapsState>(SEATMAPS_STATE);
export const selectSeatmapsState = createFeatureSelector<SeatmapsState>(SEATMAPS_STATE);
export const selectSeatmapFlight = createSelector(selectSeatmapsState, (state) => state.data?.seatmapFlight);
export const selectSeatmap = createSelector(selectSeatmapsState, (state) => state.data?.seatmaps);
export const selectDecks = createSelector(selectSeatmapsState, (state) => state.data?.seatmaps.decks);

export const selectSeatmapsWhenISPendingStatus = createSelector(selectSeatmapsState, (state) => !!state.isPending);
export const selectSeatmapsWhenFailureStatus = createSelector(selectSeatmapsState, (state) => !!state.isFailure);
