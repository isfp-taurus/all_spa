import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ASW_CONTEXT_STORE_NAME, AswContextState } from './asw-context.state';

/** Select AswContext State */
export const selectAswContextState = createFeatureSelector<AswContextState>(ASW_CONTEXT_STORE_NAME);

/** Select AswContext isPending status */
export const selectAswContextIsPendingStatus = createSelector(selectAswContextState, (state) => !!state.isPending);

/** Select AswContext isFailure status */
export const selectAswContextIsFailureStatus = createSelector(selectAswContextState, (state) => !!state.isFailure);
