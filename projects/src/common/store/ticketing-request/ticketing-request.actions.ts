import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { TicketingRequestModel } from './ticketing-request.state';

/** StateDetailsActions */
const ACTION_SET = '[TicketingRequest] set';
const ACTION_UPDATE = '[TicketingRequest] update';
const ACTION_RESET = '[TicketingRequest] reset';
const ACTION_FAIL = '[TicketingRequest] fail';
const ACTION_CANCEL_REQUEST = '[TicketingRequest] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[TicketingRequest] set from api';
const ACTION_UPDATE_FROM_API = '[TicketingRequest] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setTicketingRequest = createAction(ACTION_SET, props<WithRequestId<TicketingRequestModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateTicketingRequest = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<TicketingRequestModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetTicketingRequest = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelTicketingRequestRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failTicketingRequest = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setTicketingRequestFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<TicketingRequestModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateTicketingRequestFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<TicketingRequestModel>>()
);
