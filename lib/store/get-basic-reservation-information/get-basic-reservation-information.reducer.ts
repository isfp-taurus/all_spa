import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '../common';
import * as actions from './get-basic-reservation-information.actions';
import { GetBasicReservationInformationState } from './get-basic-reservation-information.state';

/**
 * getBasicReservationInformation initial state
 */
export const getBasicReservationInformationInitialState: GetBasicReservationInformationState = {
  requestIds: [],
};

/**
 * List of basic actions for GetBasicReservationInformation Store
 */
export const getBasicReservationInformationReducerFeatures: ReducerTypes<
  GetBasicReservationInformationState,
  ActionCreator[]
>[] = [
  on(actions.setGetBasicReservationInformation, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateGetBasicReservationInformation, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetGetBasicReservationInformation, () => getBasicReservationInformationInitialState),

  on(actions.cancelGetBasicReservationInformationRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failGetBasicReservationInformation, (state, payload) =>
    asyncStoreItemAdapter.failRequest(state, payload.requestId)
  ),

  on(
    actions.setGetBasicReservationInformationFromApi,
    actions.updateGetBasicReservationInformationFromApi,
    (state, payload) => asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * GetBasicReservationInformation Store reducer
 */
export const getBasicReservationInformationReducer = createReducer(
  getBasicReservationInformationInitialState,
  ...getBasicReservationInformationReducerFeatures
);
