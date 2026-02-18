import { AsyncStoreItem } from '@lib/store';
import { CreateCartResponse } from 'src/sdk-reservation';

/**
 * CreateCart model
 */
export interface CreateCartModel extends CreateCartResponse {}

/**
 * CreateCartResponse model details
 */
export interface CreateCartStateDetails extends AsyncStoreItem {}

/**
 * CreateCart store state
 */
export interface CreateCartState extends CreateCartStateDetails, CreateCartModel {}

/**
 * Name of the CreateCart Store
 */
export const CREATE_CART_STORE_NAME = 'createCart';

/**
 * CreateCart Store Interface
 */
export interface CreateCartStore {
  /** CreateCart state */
  [CREATE_CART_STORE_NAME]: CreateCartState;
}
