import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GET_ESTIMATION_STORE_NAME, GetEstimationState } from './get-estimation.state';

/** Select GetEstimation State */
export const selectGetEstimationState = createFeatureSelector<GetEstimationState>(GET_ESTIMATION_STORE_NAME);

/** Select GetEstimation isPending status */
export const selectGetEstimationIsPendingStatus = createSelector(
  selectGetEstimationState,
  (state) => !!state.isPending
);

/** Select GetEstimation isFailure status */
export const selectGetEstimationIsFailureStatus = createSelector(
  selectGetEstimationState,
  (state) => !!state.isFailure
);
