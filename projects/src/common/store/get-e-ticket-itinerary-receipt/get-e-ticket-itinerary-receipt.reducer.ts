import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './get-e-ticket-itinerary-receipt.actions';
import { GetETicketItineraryReceiptState } from './get-e-ticket-itinerary-receipt.state';

/**
 * getETicketItineraryReceipt initial state
 */
export const getETicketItineraryReceiptInitialState: GetETicketItineraryReceiptState = {
  requestIds: [],
  data: {
    pdfData: '',
  },
};

/**
 * List of basic actions for GetETicketItineraryReceipt Store
 */
export const getETicketItineraryReceiptReducerFeatures: ReducerTypes<
  GetETicketItineraryReceiptState,
  ActionCreator[]
>[] = [
  on(actions.setGetETicketItineraryReceipt, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateGetETicketItineraryReceipt, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetGetETicketItineraryReceipt, () => getETicketItineraryReceiptInitialState),

  on(actions.cancelGetETicketItineraryReceiptRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failGetETicketItineraryReceipt, (state, payload) =>
    asyncStoreItemAdapter.failRequest(state, payload.requestId)
  ),

  on(actions.setGetETicketItineraryReceiptFromApi, actions.updateGetETicketItineraryReceiptFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * GetETicketItineraryReceipt Store reducer
 */
export const getETicketItineraryReceiptReducer = createReducer(
  getETicketItineraryReceiptInitialState,
  ...getETicketItineraryReceiptReducerFeatures
);
