import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { OrdersRepriceOrderModel } from './orders-reprice-order.state';

/** StateDetailsActions */
const ACTION_SET = '[OrdersRepriceOrder] set';
const ACTION_UPDATE = '[OrdersRepriceOrder] update';
const ACTION_RESET = '[OrdersRepriceOrder] reset';
const ACTION_FAIL = '[OrdersRepriceOrder] fail';
const ACTION_CANCEL_REQUEST = '[OrdersRepriceOrder] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[OrdersRepriceOrder] set from api';
const ACTION_UPDATE_FROM_API = '[OrdersRepriceOrder] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setOrdersRepriceOrder = createAction(ACTION_SET, props<WithRequestId<OrdersRepriceOrderModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateOrdersRepriceOrder = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<OrdersRepriceOrderModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetOrdersRepriceOrder = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelOrdersRepriceOrderRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failOrdersRepriceOrder = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setOrdersRepriceOrderFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<OrdersRepriceOrderModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateOrdersRepriceOrderFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<OrdersRepriceOrderModel>>()
);
