import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './update-air-offers.actions';
import { UpdateAirOffersState } from './update-air-offers.state';

/**
 * updateAirOffers initial state
 */
export const updateAirOffersInitialState: UpdateAirOffersState = {
  requestIds: [],
};

/**
 * List of basic actions for UpdateAirOffers Store
 */
export const updateAirOffersReducerFeatures: ReducerTypes<UpdateAirOffersState, ActionCreator[]>[] = [
  on(actions.setUpdateAirOffers, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateUpdateAirOffers, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetUpdateAirOffers, () => updateAirOffersInitialState),

  on(actions.cancelUpdateAirOffersRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failUpdateAirOffers, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setUpdateAirOffersFromApi, actions.updateUpdateAirOffersFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * UpdateAirOffers Store reducer
 */
export const updateAirOffersReducer = createReducer(updateAirOffersInitialState, ...updateAirOffersReducerFeatures);
