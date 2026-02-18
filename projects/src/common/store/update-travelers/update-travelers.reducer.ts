import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './update-travelers.actions';
import { UpdateTravelersState } from './update-travelers.state';

/**
 * updateTravelers initial state
 */
export const updateTravelersInitialState: UpdateTravelersState = {
  requestIds: [],
  warnings: [],
  data: {
    travelers: {
      id: 'SKH-1-EXT',
      names: {
        title: 'MR',
      },
    },
  },
};

/**
 * List of basic actions for UpdateTravelers Store
 */
export const updateTravelersReducerFeatures: ReducerTypes<UpdateTravelersState, ActionCreator[]>[] = [
  on(actions.setUpdateTravelers, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateUpdateTravelers, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetUpdateTravelers, () => updateTravelersInitialState),

  on(actions.cancelUpdateTravelersRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failUpdateTravelers, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setUpdateTravelersFromApi, actions.updateUpdateTravelersFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * UpdateTravelers Store reducer
 */
export const updateTravelersReducer = createReducer(updateTravelersInitialState, ...updateTravelersReducerFeatures);
