import { AsyncStoreItem } from '@lib/store';
import { CartsUpdateServicesResponse } from 'src/sdk-reservation';

/**
 * CartsUpdateServices model
 */
export interface CartsUpdateServicesModel extends CartsUpdateServicesResponse {}

/**
 *  model details
 */
export interface CartsUpdateServicesStateDetails extends AsyncStoreItem {}

/**
 * CartsUpdateServices store state
 */
export interface CartsUpdateServicesState extends CartsUpdateServicesStateDetails, CartsUpdateServicesModel {}

/**
 * Name of the CartsUpdateServices Store
 */
export const CARTS_UPDATE_SERVICES_STORE_NAME = 'cartsUpdateServices';

/**
 * CartsUpdateServices Store Interface
 */
export interface CartsUpdateServicesStore {
  /** CartsUpdateServices state */
  [CARTS_UPDATE_SERVICES_STORE_NAME]: CartsUpdateServicesState;
}
