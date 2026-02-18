import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GET_APPROVERS_STORE_NAME, GetApproversState } from './get-approvers.state';

/** Select GetApprovers State */
export const selectGetApproversState = createFeatureSelector<GetApproversState>(GET_APPROVERS_STORE_NAME);

/** Select GetApprovers isPending status */
export const selectGetApproversIsPendingStatus = createSelector(selectGetApproversState, (state) => !!state.isPending);

/** Select GetApprovers isFailure status */
export const selectGetApproversIsFailureStatus = createSelector(selectGetApproversState, (state) => !!state.isFailure);
