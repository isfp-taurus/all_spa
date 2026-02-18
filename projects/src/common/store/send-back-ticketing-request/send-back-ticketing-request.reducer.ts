import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './send-back-ticketing-request.actions';
import { SendBackTicketingRequestState } from './send-back-ticketing-request.state';

/**
 * sendBackTicketingRequest initial state
 */
export const sendBackTicketingRequestInitialState: SendBackTicketingRequestState = {
  requestIds: [],
};

/**
 * List of basic actions for SendBackTicketingRequest Store
 */
export const sendBackTicketingRequestReducerFeatures: ReducerTypes<SendBackTicketingRequestState, ActionCreator[]>[] = [
  on(actions.setSendBackTicketingRequest, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateSendBackTicketingRequest, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetSendBackTicketingRequest, () => sendBackTicketingRequestInitialState),

  on(actions.cancelSendBackTicketingRequestRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failSendBackTicketingRequest, (state, payload) =>
    asyncStoreItemAdapter.failRequest(state, payload.requestId)
  ),

  on(actions.setSendBackTicketingRequestFromApi, actions.updateSendBackTicketingRequestFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * SendBackTicketingRequest Store reducer
 */
export const sendBackTicketingRequestReducer = createReducer(
  sendBackTicketingRequestInitialState,
  ...sendBackTicketingRequestReducerFeatures
);
