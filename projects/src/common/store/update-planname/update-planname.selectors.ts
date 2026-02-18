import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UPDATE_PLANNAME_STORE_NAME, UpdatePlannameState } from './update-planname.state';

/** Select UpdatePlanname State */
export const selectUpdatePlannameState = createFeatureSelector<UpdatePlannameState>(UPDATE_PLANNAME_STORE_NAME);

/** Select UpdatePlanname isPending status */
export const selectUpdatePlannameIsPendingStatus = createSelector(
  selectUpdatePlannameState,
  (state) => !!state.isPending
);

/** Select UpdatePlanname isFailure status */
export const selectUpdatePlannameIsFailureStatus = createSelector(
  selectUpdatePlannameState,
  (state) => !!state.isFailure
);
