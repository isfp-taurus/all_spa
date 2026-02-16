import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './add-travelers.actions';
import { AddTravelersState } from './add-travelers.state';

/**
 * addTravelers initial state
 */
export const addTravelersInitialState: AddTravelersState = {
  requestIds: [],
};

/**
 * List of basic actions for AddTravelers Store
 */
export const addTravelersReducerFeatures: ReducerTypes<AddTravelersState, ActionCreator[]>[] = [
  on(actions.setAddTravelers, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateAddTravelers, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetAddTravelers, () => addTravelersInitialState),

  on(actions.cancelAddTravelersRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failAddTravelers, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setAddTravelersFromApi, actions.updateAddTravelersFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * AddTravelers Store reducer
 */
export const addTravelersReducer = createReducer(addTravelersInitialState, ...addTravelersReducerFeatures);
