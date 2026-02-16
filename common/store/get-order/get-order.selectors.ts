import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GET_ORDER_STORE_NAME, GetOrderState } from './get-order.state';

/** Select GetOrder State */
export const selectGetOrderState = createFeatureSelector<GetOrderState>(GET_ORDER_STORE_NAME);

/** Select GetOrder isPending status */
export const selectGetOrderIsPendingStatus = createSelector(selectGetOrderState, (state) => !!state.isPending);

/** Select GetOrder isFailure status */
export const selectGetOrderIsFailureStatus = createSelector(selectGetOrderState, (state) => !!state.isFailure);
