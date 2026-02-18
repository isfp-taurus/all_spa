import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ANA_BIZ_CONTEXT_STORE_NAME, AnaBizContextState } from './ana-biz-context.state';

/** Select AnaBizContext State */
export const selectAnaBizContextState = createFeatureSelector<AnaBizContextState>(ANA_BIZ_CONTEXT_STORE_NAME);

/** Select AnaBizContext isPending status */
export const selectAnaBizContextIsPendingStatus = createSelector(
  selectAnaBizContextState,
  (state) => !!state.isPending
);

/** Select AnaBizContext isFailure status */
export const selectAnaBizContextIsFailureStatus = createSelector(
  selectAnaBizContextState,
  (state) => !!state.isFailure
);
