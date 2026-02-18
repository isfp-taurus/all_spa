import { AsyncStoreItem } from '@lib/store';
import { PostGetCartResponse } from 'src/sdk-reservation';

/**
 * CurrentCart model
 */
export interface CurrentCartModel extends PostGetCartResponse {}

/**
 * PostGetCartResponse model details
 */
export interface CurrentCartStateDetails extends AsyncStoreItem {}

/**
 * CurrentCart store state
 */
export interface CurrentCartState extends CurrentCartStateDetails, CurrentCartModel {
  requestId?: string;
}

/**
 * Name of the CurrentCart Store
 */
export const CURRENT_CART_STORE_NAME = 'currentCart';

/**
 * CurrentCart Store Interface
 */
export interface CurrentCartStore {
  /** CurrentCart state */
  [CURRENT_CART_STORE_NAME]: CurrentCartState;
}
