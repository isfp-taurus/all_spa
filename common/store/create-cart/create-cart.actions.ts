import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { CreateCartModel } from './create-cart.state';

/** StateDetailsActions */
const ACTION_SET = '[CreateCart] set';
const ACTION_UPDATE = '[CreateCart] update';
const ACTION_RESET = '[CreateCart] reset';
const ACTION_FAIL = '[CreateCart] fail';
const ACTION_CANCEL_REQUEST = '[CreateCart] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[CreateCart] set from api';
const ACTION_UPDATE_FROM_API = '[CreateCart] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setCreateCart = createAction(ACTION_SET, props<WithRequestId<CreateCartModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateCreateCart = createAction(ACTION_UPDATE, props<WithRequestId<Partial<CreateCartModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetCreateCart = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelCreateCartRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failCreateCart = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setCreateCartFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<CreateCartModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateCreateCartFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<CreateCartModel>>()
);
