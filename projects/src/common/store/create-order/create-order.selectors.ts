import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CREATE_ORDER_STORE_NAME, CreateOrderState } from './create-order.state';

/** Select CreateOrder State */
export const selectCreateOrderState = createFeatureSelector<CreateOrderState>(CREATE_ORDER_STORE_NAME);

/** Select CreateOrder isPending status */
export const selectCreateOrderIsPendingStatus = createSelector(selectCreateOrderState, (state) => !!state.isPending);

/** Select CreateOrder isFailure status */
export const selectCreateOrderIsFailureStatus = createSelector(selectCreateOrderState, (state) => !!state.isFailure);
