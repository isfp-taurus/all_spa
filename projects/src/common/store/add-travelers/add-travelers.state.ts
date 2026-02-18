import { AsyncStoreItem } from '@lib/store';
import { CartsAddTravelersResponse } from 'src/sdk-reservation';

/**
 * AddTravelers model
 */
export interface AddTravelersModel extends CartsAddTravelersResponse {}

/**
 * CartsAddTravelersResponse model details
 */
export interface AddTravelersStateDetails extends AsyncStoreItem {}

/**
 * AddTravelers store state
 */
export interface AddTravelersState extends AddTravelersStateDetails, AddTravelersModel {}

/**
 * Name of the AddTravelers Store
 */
export const ADD_TRAVELERS_STORE_NAME = 'addTravelers';

/**
 * AddTravelers Store Interface
 */
export interface AddTravelersStore {
  /** AddTravelers state */
  [ADD_TRAVELERS_STORE_NAME]: AddTravelersState;
}
