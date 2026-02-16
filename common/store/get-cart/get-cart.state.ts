import { AsyncStoreItem } from '@lib/store';
import { PostGetCartResponse } from 'src/sdk-reservation';

/**
 * GetCart model
 */
export interface GetCartModel extends PostGetCartResponse {}

/**
 * PostGetCartResponse model details
 */
export interface GetCartStateDetails extends AsyncStoreItem, GetCartModel {}

/**
 * GetCart store state
 */
export interface GetCartState extends GetCartStateDetails {
  requestId?: string;
}

/**
 * Name of the GetCart Store
 */
export const GET_CART_STORE_NAME = 'getCart';

/**
 * GetCart Store Interface
 */
export interface GetCartStore {
  /** GetCart state */
  [GET_CART_STORE_NAME]: GetCartState;
}
