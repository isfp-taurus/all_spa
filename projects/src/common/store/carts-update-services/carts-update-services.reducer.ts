import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './carts-update-services.actions';
import { CartsUpdateServicesState } from './carts-update-services.state';

/**
 * cartsUpdateServices initial state
 */
export const cartsUpdateServicesInitialState: CartsUpdateServicesState = {
  requestIds: [],
};

/**
 * List of basic actions for CartsUpdateServices Store
 */
export const cartsUpdateServicesReducerFeatures: ReducerTypes<CartsUpdateServicesState, ActionCreator[]>[] = [
  on(actions.setCartsUpdateServices, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateCartsUpdateServices, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetCartsUpdateServices, () => cartsUpdateServicesInitialState),

  on(actions.cancelCartsUpdateServicesRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failCartsUpdateServices, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setCartsUpdateServicesFromApi, actions.updateCartsUpdateServicesFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * CartsUpdateServices Store reducer
 */
export const cartsUpdateServicesReducer = createReducer(
  cartsUpdateServicesInitialState,
  ...cartsUpdateServicesReducerFeatures
);
