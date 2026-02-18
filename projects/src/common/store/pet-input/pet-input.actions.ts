import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { PetInputModel } from './pet-input.state';

/** StateDetailsActions */
const ACTION_SET = '[PetInput] set';
const ACTION_UPDATE = '[PetInput] update';
const ACTION_RESET = '[PetInput] reset';
const ACTION_FAIL = '[PetInput] fail';
const ACTION_CANCEL_REQUEST = '[PetInput] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[PetInput] set from api';
const ACTION_UPDATE_FROM_API = '[PetInput] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setPetInput = createAction(ACTION_SET, props<WithRequestId<PetInputModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updatePetInput = createAction(ACTION_UPDATE, props<WithRequestId<Partial<PetInputModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetPetInput = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelPetInputRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failPetInput = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setPetInputFromApi = createAction(ACTION_SET_FROM_API, asyncProps<FromApiActionPayload<PetInputModel>>());

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updatePetInputFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<PetInputModel>>()
);
