import { AsyncStoreItem } from '@lib/store';
import { OrdersDeletePrebookedOrderResponse } from 'src/sdk-reservation';

/**
 * DeletePrebookedOrder model
 */
export interface DeletePrebookedOrderModel extends OrdersDeletePrebookedOrderResponse {}

/**
 * OrdersDeletePrebookedOrderResponse model details
 */
export interface DeletePrebookedOrderStateDetails extends AsyncStoreItem {}

/**
 * DeletePrebookedOrder store state
 */
export interface DeletePrebookedOrderState extends DeletePrebookedOrderStateDetails, DeletePrebookedOrderModel {}

/**
 * Name of the DeletePrebookedOrder Store
 */
export const DELETE_PREBOOKED_ORDER_STORE_NAME = 'deletePrebookedOrder';

/**
 * DeletePrebookedOrder Store Interface
 */
export interface DeletePrebookedOrderStore {
  /** DeletePrebookedOrder state */
  [DELETE_PREBOOKED_ORDER_STORE_NAME]: DeletePrebookedOrderState;
}
