import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './get-credit-pan-information.actions';
import { GetCreditPanInformationState } from './get-credit-pan-information.state';

/**
 * getCreditPanInformation initial state
 */
export const getCreditPanInformationInitialState: GetCreditPanInformationState = {
  model: null,
  requestIds: [],
};

/**
 * List of basic actions for GetCreditPanInformation Store
 */
export const getCreditPanInformationReducerFeatures: ReducerTypes<GetCreditPanInformationState, ActionCreator[]>[] = [
  on(actions.setGetCreditPanInformation, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateGetCreditPanInformation, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetGetCreditPanInformation, () => getCreditPanInformationInitialState),

  on(actions.cancelGetCreditPanInformationRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failGetCreditPanInformation, (state, payload) =>
    asyncStoreItemAdapter.failRequest(state, payload.requestId)
  ),

  on(actions.setGetCreditPanInformationFromApi, actions.updateGetCreditPanInformationFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * GetCreditPanInformation Store reducer
 */
export const getCreditPanInformationReducer = createReducer(
  getCreditPanInformationInitialState,
  ...getCreditPanInformationReducerFeatures
);
