import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { SendBackTicketingRequestModel } from './send-back-ticketing-request.state';

/** StateDetailsActions */
const ACTION_SET = '[SendBackTicketingRequest] set';
const ACTION_UPDATE = '[SendBackTicketingRequest] update';
const ACTION_RESET = '[SendBackTicketingRequest] reset';
const ACTION_FAIL = '[SendBackTicketingRequest] fail';
const ACTION_CANCEL_REQUEST = '[SendBackTicketingRequest] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[SendBackTicketingRequest] set from api';
const ACTION_UPDATE_FROM_API = '[SendBackTicketingRequest] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setSendBackTicketingRequest = createAction(
  ACTION_SET,
  props<WithRequestId<SendBackTicketingRequestModel>>()
);

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateSendBackTicketingRequest = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<SendBackTicketingRequestModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetSendBackTicketingRequest = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelSendBackTicketingRequestRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failSendBackTicketingRequest = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setSendBackTicketingRequestFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<SendBackTicketingRequestModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateSendBackTicketingRequestFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<SendBackTicketingRequestModel>>()
);
