import { AsyncStoreItem } from '@lib/store';
import { PetRakunoriResponse } from 'src/sdk-servicing';

/**
 * CartsUpdatePetRakunori model
 */
export interface CartsUpdatePetRakunoriModel extends PetRakunoriResponse {}

/**
 * PatchCartsUpdatePetRakunoriResponse model details
 */
export interface CartsUpdatePetRakunoriStateDetails extends AsyncStoreItem {}

/**
 * CartsUpdatePetRakunori store state
 */
export interface CartsUpdatePetRakunoriState extends CartsUpdatePetRakunoriStateDetails, CartsUpdatePetRakunoriModel {}

/**
 * Name of the CartsUpdatePetRakunori Store
 */
export const UPDATE_PET_RAKUNORI_STORE_NAME = 'updatePetRakunori';

/**
 * CartsUpdatePetRakunori Store Interface
 */
export interface CartsUpdatePetRakunoriStore {
  /** CartsUpdatePetRakunori state */
  [UPDATE_PET_RAKUNORI_STORE_NAME]: CartsUpdatePetRakunoriState;
}
