import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ORDERS_PAYMENT_RECORDS_STORE_NAME, OrdersPaymentRecordsState } from './orders-payment-records.state';

/** Select OrdersPaymentRecords State */
export const selectOrdersPaymentRecordsState = createFeatureSelector<OrdersPaymentRecordsState>(
  ORDERS_PAYMENT_RECORDS_STORE_NAME
);

/** Select OrdersPaymentRecords isPending status */
export const selectOrdersPaymentRecordsIsPendingStatus = createSelector(
  selectOrdersPaymentRecordsState,
  (state) => !!state.isPending
);

/** Select OrdersPaymentRecords isFailure status */
export const selectOrdersPaymentRecordsIsFailureStatus = createSelector(
  selectOrdersPaymentRecordsState,
  (state) => !!state.isFailure
);
