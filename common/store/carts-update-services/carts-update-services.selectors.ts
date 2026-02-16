import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CARTS_UPDATE_SERVICES_STORE_NAME, CartsUpdateServicesState } from './carts-update-services.state';

/** Select CartsUpdateServices State */
export const selectCartsUpdateServicesState = createFeatureSelector<CartsUpdateServicesState>(
  CARTS_UPDATE_SERVICES_STORE_NAME
);

/** Select CartsUpdateServices isPending status */
export const selectCartsUpdateServicesIsPendingStatus = createSelector(
  selectCartsUpdateServicesState,
  (state) => !!state.isPending
);

/** Select CartsUpdateServices isFailure status */
export const selectCartsUpdateServicesIsFailureStatus = createSelector(
  selectCartsUpdateServicesState,
  (state) => !!state.isFailure
);
