import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { PaymentInputModel } from './payment-input.state';

/** StateDetailsActions */
const ACTION_SET = '[PaymentInput] set';
const ACTION_UPDATE = '[PaymentInput] update';
const ACTION_RESET = '[PaymentInput] reset';
const ACTION_FAIL = '[PaymentInput] fail';
const ACTION_CANCEL_REQUEST = '[PaymentInput] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[PaymentInput] set from api';
const ACTION_UPDATE_FROM_API = '[PaymentInput] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setPaymentInput = createAction(ACTION_SET, props<WithRequestId<PaymentInputModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updatePaymentInput = createAction(ACTION_UPDATE, props<WithRequestId<Partial<PaymentInputModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetPaymentInput = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelPaymentInputRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failPaymentInput = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setPaymentInputFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<PaymentInputModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updatePaymentInputFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<PaymentInputModel>>()
);
