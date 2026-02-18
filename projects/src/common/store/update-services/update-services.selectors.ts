import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UPDATE_SERVICES_STORE_NAME, UpdateServicesState } from './update-services.state';

/** Select UpdateServices State */
export const selectUpdateServicesState = createFeatureSelector<UpdateServicesState>(UPDATE_SERVICES_STORE_NAME);

/** Select UpdateServices isPending status */
export const selectUpdateServicesIsPendingStatus = createSelector(
  selectUpdateServicesState,
  (state) => !!state.isPending
);

/** Select UpdateServices isFailure status */
export const selectUpdateServicesIsFailureStatus = createSelector(
  selectUpdateServicesState,
  (state) => !!state.isFailure
);
