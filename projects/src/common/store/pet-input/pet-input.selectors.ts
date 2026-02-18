import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PET_INPUT_STORE_NAME, PetInputState } from './pet-input.state';

/** Select PetInput State */
export const selectPetInputState = createFeatureSelector<PetInputState>(PET_INPUT_STORE_NAME);

/** Select PetInput isPending status */
export const selectPetInputIsPendingStatus = createSelector(selectPetInputState, (state) => !!state.isPending);

/** Select PetInput isFailure status */
export const selectPetInputIsFailureStatus = createSelector(selectPetInputState, (state) => !!state.isFailure);
