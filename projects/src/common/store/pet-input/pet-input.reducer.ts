import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './pet-input.actions';
import { PetInputState } from './pet-input.state';

/**
 * petInput initial state
 */
export const petInputInitialState: PetInputState = {
  requestIds: [],
  cartId: '',
  travelers: [],
  representativeTravelerId: '',
  petDetails: [],
  registeredPetDetails: [],
  maxCageSize: '',
  maxCageWeight: '',
};

/**
 * List of basic actions for PetInput Store
 */
export const petInputReducerFeatures: ReducerTypes<PetInputState, ActionCreator[]>[] = [
  on(actions.setPetInput, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updatePetInput, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetPetInput, () => petInputInitialState),

  on(actions.cancelPetInputRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failPetInput, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setPetInputFromApi, actions.updatePetInputFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * PetInput Store reducer
 */
export const petInputReducer = createReducer(petInputInitialState, ...petInputReducerFeatures);
