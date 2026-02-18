import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './ticketing-request.actions';
import { TicketingRequestState } from './ticketing-request.state';

/**
 * ticketingRequest initial state
 */
export const ticketingRequestInitialState: TicketingRequestState = {
  requestIds: [],
};

/**
 * List of basic actions for TicketingRequest Store
 */
export const ticketingRequestReducerFeatures: ReducerTypes<TicketingRequestState, ActionCreator[]>[] = [
  on(actions.setTicketingRequest, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateTicketingRequest, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetTicketingRequest, () => ticketingRequestInitialState),

  on(actions.cancelTicketingRequestRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failTicketingRequest, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setTicketingRequestFromApi, actions.updateTicketingRequestFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * TicketingRequest Store reducer
 */
export const ticketingRequestReducer = createReducer(ticketingRequestInitialState, ...ticketingRequestReducerFeatures);
