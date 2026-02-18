import { GetEncryptedLoginInfoResponse } from 'src/sdk-user';
import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '../common';
import { GetEncryptedLoginInfoModel } from './get-encrypted-login-info.state';

/** StateDetailsActions */
const ACTION_SET = '[GetEncryptedLoginInfo] set';
const ACTION_UPDATE = '[GetEncryptedLoginInfo] update';
const ACTION_RESET = '[GetEncryptedLoginInfo] reset';
const ACTION_FAIL = '[GetEncryptedLoginInfo] fail';
const ACTION_CANCEL_REQUEST = '[GetEncryptedLoginInfo] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[GetEncryptedLoginInfo] set from api';
const ACTION_UPDATE_FROM_API = '[GetEncryptedLoginInfo] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setGetEncryptedLoginInfo = createAction(ACTION_SET, props<WithRequestId<GetEncryptedLoginInfoModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateGetEncryptedLoginInfo = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<GetEncryptedLoginInfoModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetGetEncryptedLoginInfo = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelGetEncryptedLoginInfoRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failGetEncryptedLoginInfo = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setGetEncryptedLoginInfoFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<GetEncryptedLoginInfoResponse>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateGetEncryptedLoginInfoFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<GetEncryptedLoginInfoResponse>>()
);
