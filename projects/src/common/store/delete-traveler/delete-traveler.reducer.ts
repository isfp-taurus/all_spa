import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './delete-traveler.actions';
import { DeleteTravelerState } from './delete-traveler.state';

/**
 * deleteTraveler initial state
 */
export const deleteTravelerInitialState: DeleteTravelerState = {
  requestIds: [],
};

/**
 * List of basic actions for DeleteTraveler Store
 */
export const deleteTravelerReducerFeatures: ReducerTypes<DeleteTravelerState, ActionCreator[]>[] = [
  on(actions.setDeleteTraveler, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateDeleteTraveler, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetDeleteTraveler, () => deleteTravelerInitialState),

  on(actions.cancelDeleteTravelerRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failDeleteTraveler, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setDeleteTravelerFromApi, actions.updateDeleteTravelerFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * DeleteTraveler Store reducer
 */
export const deleteTravelerReducer = createReducer(deleteTravelerInitialState, ...deleteTravelerReducerFeatures);
