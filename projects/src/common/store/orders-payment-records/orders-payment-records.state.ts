import { AsyncStoreItem } from '@lib/store';
import { OrdersPaymentRecordsResponse } from 'src/sdk-reservation';

/**
 * OrdersPaymentRecords model
 */
export interface OrdersPaymentRecordsModel extends OrdersPaymentRecordsResponse {}

/**
 * OrdersPaymentRecordsResponse model details
 */
export interface OrdersPaymentRecordsStateDetails extends AsyncStoreItem, OrdersPaymentRecordsModel {}

/**
 * OrdersPaymentRecords store state
 */
export interface OrdersPaymentRecordsState extends OrdersPaymentRecordsStateDetails {}

/**
 * Name of the OrdersPaymentRecords Store
 */
export const ORDERS_PAYMENT_RECORDS_STORE_NAME = 'ordersPaymentRecords';

/**
 * OrdersPaymentRecords Store Interface
 */
export interface OrdersPaymentRecordsStore {
  /** OrdersPaymentRecords state */
  [ORDERS_PAYMENT_RECORDS_STORE_NAME]: OrdersPaymentRecordsState;
}
