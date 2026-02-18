import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './update-services.actions';
import { UpdateServicesState } from './update-services.state';

/**
 * UpdateServices initial state
 */
export const UpdateServicesInitialState: UpdateServicesState = {
  requestIds: [],
};

/**
 * List of basic actions for UpdateServices Store
 */
export const UpdateServicesReducerFeatures: ReducerTypes<UpdateServicesState, ActionCreator[]>[] = [
  on(actions.setUpdateServices, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateUpdateServices, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetUpdateServices, () => UpdateServicesInitialState),

  on(actions.cancelUpdateServicesRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failUpdateServices, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setUpdateServicesFromApi, actions.updateUpdateServicesFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * UpdateServices Store reducer
 */
export const UpdateServicesReducer = createReducer(UpdateServicesInitialState, ...UpdateServicesReducerFeatures);
