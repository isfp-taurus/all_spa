import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { CurrentCartModel } from './current-cart.state';

/** StateDetailsActions */
const ACTION_SET = '[CurrentCart] set';
const ACTION_UPDATE = '[CurrentCart] update';
const ACTION_RESET = '[CurrentCart] reset';
const ACTION_FAIL = '[CurrentCart] fail';
const ACTION_CANCEL_REQUEST = '[CurrentCart] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[CurrentCart] set from api';
const ACTION_UPDATE_FROM_API = '[CurrentCart] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setCurrentCart = createAction(ACTION_SET, props<WithRequestId<CurrentCartModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateCurrentCart = createAction(ACTION_UPDATE, props<WithRequestId<Partial<CurrentCartModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetCurrentCart = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelCurrentCartRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failCurrentCart = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setCurrentCartFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<CurrentCartModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateCurrentCartFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<CurrentCartModel>>()
);
