import { AsyncStoreItem } from '@lib/store';
import { OrdersCreateOrderResponse } from 'src/sdk-reservation';

/**
 * CreateOrder model
 */
export interface CreateOrderModel extends OrdersCreateOrderResponse {}

/**
 * OrdersCreateOrderResponse model details
 */
export interface CreateOrderStateDetails extends AsyncStoreItem {}

/**
 * CreateOrder store state
 */
export interface CreateOrderState extends CreateOrderStateDetails, CreateOrderModel {}

/**
 * Name of the CreateOrder Store
 */
export const CREATE_ORDER_STORE_NAME = 'createOrder';

/**
 * CreateOrder Store Interface
 */
export interface CreateOrderStore {
  /** CreateOrder state */
  [CREATE_ORDER_STORE_NAME]: CreateOrderState;
}
