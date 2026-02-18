import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './current-cart.actions';
import { CurrentCartState } from './current-cart.state';
import { ContactsRepresentative } from 'src/sdk-reservation';
/**
 * currentCart initial state
 */
export const currentCartInitialState: CurrentCartState = {
  requestIds: [],
  data: {
    cartId: '',
    plan: {},
  },
};

/**
 * List of basic actions for CurrentCart Store
 */
export const currentCartReducerFeatures: ReducerTypes<CurrentCartState, ActionCreator[]>[] = [
  on(actions.setCurrentCart, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateCurrentCart, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetCurrentCart, () => currentCartInitialState),

  on(actions.cancelCurrentCartRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failCurrentCart, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setCurrentCartFromApi, actions.updateCurrentCartFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * CurrentCart Store reducer
 */
export const currentCartReducer = createReducer(currentCartInitialState, ...currentCartReducerFeatures);
