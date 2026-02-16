import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './orders-reprice-order.actions';
import { OrdersRepriceOrderState } from './orders-reprice-order.state';

/**
 * ordersRepriceOrder initial state
 */
export const ordersRepriceOrderInitialState: OrdersRepriceOrderState = {
  requestIds: [],
};

/**
 * List of basic actions for OrdersRepriceOrder Store
 */
export const ordersRepriceOrderReducerFeatures: ReducerTypes<OrdersRepriceOrderState, ActionCreator[]>[] = [
  on(actions.setOrdersRepriceOrder, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateOrdersRepriceOrder, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetOrdersRepriceOrder, () => ordersRepriceOrderInitialState),

  on(actions.cancelOrdersRepriceOrderRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failOrdersRepriceOrder, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setOrdersRepriceOrderFromApi, actions.updateOrdersRepriceOrderFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * OrdersRepriceOrder Store reducer
 */
export const ordersRepriceOrderReducer = createReducer(
  ordersRepriceOrderInitialState,
  ...ordersRepriceOrderReducerFeatures
);
