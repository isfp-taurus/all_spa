import { AsyncStoreItem } from '@lib/store';
import { GetOrderResponse } from 'src/sdk-servicing';

/**
 * GetOrder model
 */
export interface GetOrderModel extends GetOrderResponse {}

/**
 * GetOrderResponse model details
 */
export interface GetOrderStateDetails extends AsyncStoreItem, GetOrderModel {}

/**
 * GetOrder store state
 */
export interface GetOrderState extends GetOrderStateDetails, GetOrderModel {}

/**
 * Name of the GetOrder Store
 */
export const GET_ORDER_STORE_NAME = 'getOrder';

/**
 * GetOrder Store Interface
 */
export interface GetOrderStore {
  /** GetOrder state */
  [GET_ORDER_STORE_NAME]: GetOrderState;
}
