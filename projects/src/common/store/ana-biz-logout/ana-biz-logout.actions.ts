import { AnaBizLogoutModel } from '@common/interfaces';
import { AsyncRequest, FromApiActionPayload, WithRequestId, asyncProps } from '@lib/store';
import { createAction, props } from '@ngrx/store';

/** StateDetailsActions */
const ACTION_SET = '[AnaBizLogout] set';
const ACTION_UPDATE = '[AnaBizLogout] update';
const ACTION_RESET = '[AnaBizLogout] reset';
const ACTION_FAIL = '[AnaBizLogout] fail';
const ACTION_CANCEL_REQUEST = '[AnaBizLogout] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[AnaBizLogout] set from api';
const ACTION_UPDATE_FROM_API = '[AnaBizLogout] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setAnaBizLogout = createAction(ACTION_SET, props<WithRequestId<AnaBizLogoutModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateAnaBizLogout = createAction(ACTION_UPDATE, props<WithRequestId<Partial<AnaBizLogoutModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetAnaBizLogout = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelAnaBizLogoutRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failAnaBizLogout = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setAnaBizLogoutFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<AnaBizLogoutModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateAnaBizLogoutFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<AnaBizLogoutModel>>()
);
