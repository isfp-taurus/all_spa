import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ORDERS_REPRICE_ORDER_STORE_NAME, OrdersRepriceOrderState } from './orders-reprice-order.state';

/** Select OrdersRepriceOrder State */
export const selectOrdersRepriceOrderState = createFeatureSelector<OrdersRepriceOrderState>(
  ORDERS_REPRICE_ORDER_STORE_NAME
);

/** Select OrdersRepriceOrder isPending status */
export const selectOrdersRepriceOrderIsPendingStatus = createSelector(
  selectOrdersRepriceOrderState,
  (state) => !!state.isPending
);

/** Select OrdersRepriceOrder isFailure status */
export const selectOrdersRepriceOrderIsFailureStatus = createSelector(
  selectOrdersRepriceOrderState,
  (state) => !!state.isFailure
);
