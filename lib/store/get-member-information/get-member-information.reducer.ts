import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '../common';
import * as actions from './get-member-information.actions';
import { GetMemberInformationState } from './get-member-information.state';

/**
 * getMemberInformation initial state
 */
export const getMemberInformationInitialState: GetMemberInformationState = {
  model: null,
  requestIds: [],
};

/**
 * List of basic actions for GetMemberInformation Store
 */
export const getMemberInformationReducerFeatures: ReducerTypes<GetMemberInformationState, ActionCreator[]>[] = [
  on(actions.setGetMemberInformation, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateGetMemberInformation, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetGetMemberInformation, () => getMemberInformationInitialState),

  on(actions.cancelGetMemberInformationRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failGetMemberInformation, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setGetMemberInformationFromApi, actions.updateGetMemberInformationFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * GetMemberInformation Store reducer
 */
export const getMemberInformationReducer = createReducer(
  getMemberInformationInitialState,
  ...getMemberInformationReducerFeatures
);
