import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { GetCartModel } from './get-cart.state';

/** StateDetailsActions */
const ACTION_SET = '[GetCart] set';
const ACTION_UPDATE = '[GetCart] update';
const ACTION_RESET = '[GetCart] reset';
const ACTION_FAIL = '[GetCart] fail';
const ACTION_CANCEL_REQUEST = '[GetCart] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[GetCart] set from api';
const ACTION_UPDATE_FROM_API = '[GetCart] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setGetCart = createAction(ACTION_SET, props<WithRequestId<GetCartModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateGetCart = createAction(ACTION_UPDATE, props<WithRequestId<Partial<GetCartModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetGetCart = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelGetCartRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failGetCart = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setGetCartFromApi = createAction(ACTION_SET_FROM_API, asyncProps<FromApiActionPayload<GetCartModel>>());

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateGetCartFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<GetCartModel>>()
);
