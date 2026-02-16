import { AnaBizLoginModel } from '@common/interfaces';
import { AsyncRequest, FromApiActionPayload, WithRequestId, asyncProps } from '@lib/store';
import { createAction, props } from '@ngrx/store';

/** StateDetailsActions */
const ACTION_SET = '[AnaBizLogin] set';
const ACTION_UPDATE = '[AnaBizLogin] update';
const ACTION_RESET = '[AnaBizLogin] reset';
const ACTION_FAIL = '[AnaBizLogin] fail';
const ACTION_CANCEL_REQUEST = '[AnaBizLogin] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[AnaBizLogin] set from api';
const ACTION_UPDATE_FROM_API = '[AnaBizLogin] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setAnaBizLogin = createAction(ACTION_SET, props<WithRequestId<AnaBizLoginModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateAnaBizLogin = createAction(ACTION_UPDATE, props<WithRequestId<Partial<AnaBizLoginModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetAnaBizLogin = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelAnaBizLoginRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failAnaBizLogin = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setAnaBizLoginFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<AnaBizLoginModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateAnaBizLoginFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<AnaBizLoginModel>>()
);
