import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './orders-payment-records.actions';
import { OrdersPaymentRecordsState } from './orders-payment-records.state';

/**
 * ordersPaymentRecords initial state
 */
export const ordersPaymentRecordsInitialState: OrdersPaymentRecordsState = {
  requestIds: [],
};

/**
 * List of basic actions for OrdersPaymentRecords Store
 */
export const ordersPaymentRecordsReducerFeatures: ReducerTypes<OrdersPaymentRecordsState, ActionCreator[]>[] = [
  on(actions.setOrdersPaymentRecords, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateOrdersPaymentRecords, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetOrdersPaymentRecords, () => ordersPaymentRecordsInitialState),

  on(actions.cancelOrdersPaymentRecordsRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failOrdersPaymentRecords, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setOrdersPaymentRecordsFromApi, actions.updateOrdersPaymentRecordsFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * OrdersPaymentRecords Store reducer
 */
export const ordersPaymentRecordsReducer = createReducer(
  ordersPaymentRecordsInitialState,
  ...ordersPaymentRecordsReducerFeatures
);
