import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { GetETicketItineraryReceiptModel } from './get-e-ticket-itinerary-receipt.state';

/** StateDetailsActions */
const ACTION_SET = '[GetETicketItineraryReceipt] set';
const ACTION_UPDATE = '[GetETicketItineraryReceipt] update';
const ACTION_RESET = '[GetETicketItineraryReceipt] reset';
const ACTION_FAIL = '[GetETicketItineraryReceipt] fail';
const ACTION_CANCEL_REQUEST = '[GetETicketItineraryReceipt] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[GetETicketItineraryReceipt] set from api';
const ACTION_UPDATE_FROM_API = '[GetETicketItineraryReceipt] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setGetETicketItineraryReceipt = createAction(
  ACTION_SET,
  props<WithRequestId<GetETicketItineraryReceiptModel>>()
);

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateGetETicketItineraryReceipt = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<GetETicketItineraryReceiptModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetGetETicketItineraryReceipt = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelGetETicketItineraryReceiptRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failGetETicketItineraryReceipt = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setGetETicketItineraryReceiptFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<GetETicketItineraryReceiptModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateGetETicketItineraryReceiptFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<GetETicketItineraryReceiptModel>>()
);
