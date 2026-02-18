import { AsyncStoreItem } from '@lib/store';
import { CartsDeleteTravelerResponse } from 'src/sdk-reservation';

/**
 * DeleteTraveler model
 */
export interface DeleteTravelerModel extends CartsDeleteTravelerResponse {}

/**
 * CartsDeleteTravelerResponse model details
 */
export interface DeleteTravelerStateDetails extends AsyncStoreItem {}

/**
 * DeleteTraveler store state
 */
export interface DeleteTravelerState extends DeleteTravelerStateDetails, DeleteTravelerModel {}

/**
 * Name of the DeleteTraveler Store
 */
export const DELETE_TRAVELER_STORE_NAME = 'deleteTraveler';

/**
 * DeleteTraveler Store Interface
 */
export interface DeleteTravelerStore {
  /** DeleteTraveler state */
  [DELETE_TRAVELER_STORE_NAME]: DeleteTravelerState;
}
