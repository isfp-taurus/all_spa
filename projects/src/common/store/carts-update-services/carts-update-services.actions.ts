import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { CartsUpdateServicesModel } from './carts-update-services.state';

/** StateDetailsActions */
const ACTION_SET = '[CartsUpdateServices] set';
const ACTION_UPDATE = '[CartsUpdateServices] update';
const ACTION_RESET = '[CartsUpdateServices] reset';
const ACTION_FAIL = '[CartsUpdateServices] fail';
const ACTION_CANCEL_REQUEST = '[CartsUpdateServices] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[CartsUpdateServices] set from api';
const ACTION_UPDATE_FROM_API = '[CartsUpdateServices] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setCartsUpdateServices = createAction(ACTION_SET, props<WithRequestId<CartsUpdateServicesModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateCartsUpdateServices = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<CartsUpdateServicesModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetCartsUpdateServices = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelCartsUpdateServicesRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failCartsUpdateServices = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setCartsUpdateServicesFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<CartsUpdateServicesModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateCartsUpdateServicesFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<CartsUpdateServicesModel>>()
);
