import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './create-order.actions';
import { CreateOrderState } from './create-order.state';

/**
 * createOrder initial state
 */
export const createOrderInitialState: CreateOrderState = {
  requestIds: [],
};

/**
 * List of basic actions for CreateOrder Store
 */
export const createOrderReducerFeatures: ReducerTypes<CreateOrderState, ActionCreator[]>[] = [
  on(actions.setCreateOrder, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateCreateOrder, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetCreateOrder, () => createOrderInitialState),

  on(actions.cancelCreateOrderRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failCreateOrder, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setCreateOrderFromApi, actions.updateCreateOrderFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * CreateOrder Store reducer
 */
export const createOrderReducer = createReducer(createOrderInitialState, ...createOrderReducerFeatures);
