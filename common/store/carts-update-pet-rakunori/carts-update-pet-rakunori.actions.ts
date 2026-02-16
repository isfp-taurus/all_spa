import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { CartsUpdatePetRakunoriModel } from './carts-update-pet-rakunori.state';

/** StateDetailsActions */
const ACTION_SET = '[CartsUpdatePetRakunori] set';
const ACTION_UPDATE = '[CartsUpdatePetRakunori] update';
const ACTION_RESET = '[CartsUpdatePetRakunori] reset';
const ACTION_FAIL = '[CartsUpdatePetRakunori] fail';
const ACTION_CANCEL_REQUEST = '[CartsUpdatePetRakunori] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[CartsUpdatePetRakunori] set from api';
const ACTION_UPDATE_FROM_API = '[CartsUpdatePetRakunori] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setCartsUpdatePetRakunori = createAction(ACTION_SET, props<WithRequestId<CartsUpdatePetRakunoriModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateCartsUpdatePetRakunori = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<CartsUpdatePetRakunoriModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetCartsUpdatePetRakunori = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelCartsUpdatePetRakunoriRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failCartsUpdatePetRakunori = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setCartsUpdatePetRakunoriFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<CartsUpdatePetRakunoriModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateCartsUpdatePetRakunoriFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<CartsUpdatePetRakunoriModel>>()
);
