import { AsyncStoreItem } from '@lib/store';
import { CartsUpdateTravelersResponse } from 'src/sdk-reservation';

/**
 * UpdateTravelers model
 */
export interface UpdateTravelersModel extends CartsUpdateTravelersResponse {}

/**
 * Type8 model details
 */
export interface UpdateTravelersStateDetails extends AsyncStoreItem {}

/**
 * UpdateTravelers store state
 */
export interface UpdateTravelersState extends UpdateTravelersStateDetails, UpdateTravelersModel {}

/**
 * Name of the UpdateTravelers Store
 */
export const UPDATE_TRAVELERS_STORE_NAME = 'updateTravelers';

/**
 * UpdateTravelers Store Interface
 */
export interface UpdateTravelersStore {
  /** UpdateTravelers state */
  [UPDATE_TRAVELERS_STORE_NAME]: UpdateTravelersState;
}
