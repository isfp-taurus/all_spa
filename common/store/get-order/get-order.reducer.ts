import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './get-order.actions';
import { GetOrderState } from './get-order.state';

/**
 * getOrder initial state
 */
export const getOrderInitialState: GetOrderState = {
  requestIds: [],
};

/**
 * List of basic actions for GetOrder Store
 */
export const getOrderReducerFeatures: ReducerTypes<GetOrderState, ActionCreator[]>[] = [
  on(actions.setGetOrder, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateGetOrder, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetGetOrder, () => getOrderInitialState),

  on(actions.cancelGetOrderRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failGetOrder, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setGetOrderFromApi, actions.updateGetOrderFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * GetOrder Store reducer
 */
export const getOrderReducer = createReducer(getOrderInitialState, ...getOrderReducerFeatures);
