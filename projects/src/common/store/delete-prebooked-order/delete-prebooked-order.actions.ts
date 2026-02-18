import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { DeletePrebookedOrderModel } from './delete-prebooked-order.state';

/** StateDetailsActions */
const ACTION_SET = '[DeletePrebookedOrder] set';
const ACTION_UPDATE = '[DeletePrebookedOrder] update';
const ACTION_RESET = '[DeletePrebookedOrder] reset';
const ACTION_FAIL = '[DeletePrebookedOrder] fail';
const ACTION_CANCEL_REQUEST = '[DeletePrebookedOrder] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[DeletePrebookedOrder] set from api';
const ACTION_UPDATE_FROM_API = '[DeletePrebookedOrder] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setDeletePrebookedOrder = createAction(ACTION_SET, props<WithRequestId<DeletePrebookedOrderModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateDeletePrebookedOrder = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<DeletePrebookedOrderModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetDeletePrebookedOrder = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelDeletePrebookedOrderRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failDeletePrebookedOrder = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setDeletePrebookedOrderFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<DeletePrebookedOrderModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateDeletePrebookedOrderFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<DeletePrebookedOrderModel>>()
);
