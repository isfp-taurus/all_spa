import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UPDATE_PET_RAKUNORI_STORE_NAME, CartsUpdatePetRakunoriState } from './carts-update-pet-rakunori.state';

/** Select CartsUpdatePetRakunori State */
export const selectCartsUpdatePetRakunoriState =
  createFeatureSelector<CartsUpdatePetRakunoriState>(UPDATE_PET_RAKUNORI_STORE_NAME);

/** Select CartsUpdatePetRakunori isPending status */
export const selectCartsUpdatePetRakunoriIsPendingStatus = createSelector(
  selectCartsUpdatePetRakunoriState,
  (state) => !!state.isPending
);

/** Select CartsUpdatePetRakunori isFailure status */
export const selectCartsUpdatePetRakunoriIsFailureStatus = createSelector(
  selectCartsUpdatePetRakunoriState,
  (state) => !!state.isFailure
);
