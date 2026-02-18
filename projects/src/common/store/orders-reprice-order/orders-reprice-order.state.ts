import { AsyncStoreItem } from '@lib/store';
import { OrdersRepriceOrderResponse } from 'src/sdk-reservation';

/**
 * OrdersRepriceOrder model
 */
export interface OrdersRepriceOrderModel extends OrdersRepriceOrderResponse {}

/**
 * OrdersRepriceOrderResponse model details
 */
export interface OrdersRepriceOrderStateDetails extends AsyncStoreItem, OrdersRepriceOrderModel {}

/**
 * OrdersRepriceOrder store state
 */
export interface OrdersRepriceOrderState extends OrdersRepriceOrderStateDetails {}

/**
 * Name of the OrdersRepriceOrder Store
 */
export const ORDERS_REPRICE_ORDER_STORE_NAME = 'ordersRepriceOrder';

/**
 * OrdersRepriceOrder Store Interface
 */
export interface OrdersRepriceOrderStore {
  /** OrdersRepriceOrder state */
  [ORDERS_REPRICE_ORDER_STORE_NAME]: OrdersRepriceOrderState;
}
