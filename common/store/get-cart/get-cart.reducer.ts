import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './get-cart.actions';
import { GetCartState } from './get-cart.state';

/**
 * getCart initial state
 */
export const getCartInitialState: GetCartState = {
  requestIds: [],
};

/**
 * List of basic actions for GetCart Store
 */
export const getCartReducerFeatures: ReducerTypes<GetCartState, ActionCreator[]>[] = [
  on(actions.setGetCart, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateGetCart, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetGetCart, () => getCartInitialState),

  on(actions.cancelGetCartRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failGetCart, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setGetCartFromApi, actions.updateGetCartFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * GetCart Store reducer
 */
export const getCartReducer = createReducer(getCartInitialState, ...getCartReducerFeatures);
