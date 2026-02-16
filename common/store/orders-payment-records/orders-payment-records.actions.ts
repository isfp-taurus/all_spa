import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { OrdersPaymentRecordsModel } from './orders-payment-records.state';

/** StateDetailsActions */
const ACTION_SET = '[OrdersPaymentRecords] set';
const ACTION_UPDATE = '[OrdersPaymentRecords] update';
const ACTION_RESET = '[OrdersPaymentRecords] reset';
const ACTION_FAIL = '[OrdersPaymentRecords] fail';
const ACTION_CANCEL_REQUEST = '[OrdersPaymentRecords] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[OrdersPaymentRecords] set from api';
const ACTION_UPDATE_FROM_API = '[OrdersPaymentRecords] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setOrdersPaymentRecords = createAction(ACTION_SET, props<WithRequestId<OrdersPaymentRecordsModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateOrdersPaymentRecords = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<OrdersPaymentRecordsModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetOrdersPaymentRecords = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelOrdersPaymentRecordsRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failOrdersPaymentRecords = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setOrdersPaymentRecordsFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<OrdersPaymentRecordsModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateOrdersPaymentRecordsFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<OrdersPaymentRecordsModel>>()
);
