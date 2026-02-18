import { createFeatureSelector, createSelector } from '@ngrx/store';
import { HISTORY_STORE_NAME, HistoryState } from './history.state';

/** Select History State */
export const selectHistoryState = createFeatureSelector<HistoryState>(HISTORY_STORE_NAME);

/** Select History isPending status */
export const selectHistoryIsPendingStatus = createSelector(selectHistoryState, (state) => !!state.isPending);

/** Select History isFailure status */
export const selectHistoryIsFailureStatus = createSelector(selectHistoryState, (state) => !!state.isFailure);
