import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './carts-update-pet-rakunori.actions';
import { CartsUpdatePetRakunoriState } from './carts-update-pet-rakunori.state';

/**
 * updatePetRakunori initial state
 */
export const updatePetRakunoriInitialState: CartsUpdatePetRakunoriState = {
  requestIds: [],
};

/**
 * List of basic actions for CartsUpdatePetRakunori Store
 */
export const updatePetRakunoriReducerFeatures: ReducerTypes<CartsUpdatePetRakunoriState, ActionCreator[]>[] = [
  on(actions.setCartsUpdatePetRakunori, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateCartsUpdatePetRakunori, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetCartsUpdatePetRakunori, () => updatePetRakunoriInitialState),

  on(actions.cancelCartsUpdatePetRakunoriRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failCartsUpdatePetRakunori, (state, payload) =>
    asyncStoreItemAdapter.failRequest(state, payload.requestId)
  ),

  on(actions.setCartsUpdatePetRakunoriFromApi, actions.updateCartsUpdatePetRakunoriFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * CartsUpdatePetRakunori Store reducer
 */
export const updatePetRakunoriReducer = createReducer(
  updatePetRakunoriInitialState,
  ...updatePetRakunoriReducerFeatures
);
