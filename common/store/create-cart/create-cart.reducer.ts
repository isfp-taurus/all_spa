import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './create-cart.actions';
import { CreateCartState } from './create-cart.state';

/**
 * createCart initial state
 */
export const createCartInitialState: CreateCartState = {
  requestIds: [],
};

/**
 * List of basic actions for CreateCart Store
 */
export const createCartReducerFeatures: ReducerTypes<CreateCartState, ActionCreator[]>[] = [
  on(actions.setCreateCart, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateCreateCart, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetCreateCart, () => createCartInitialState),

  on(actions.cancelCreateCartRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failCreateCart, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setCreateCartFromApi, actions.updateCreateCartFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * CreateCart Store reducer
 */
export const createCartReducer = createReducer(createCartInitialState, ...createCartReducerFeatures);
