import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { CaptchaAuthenticationStatusGetModel } from './captcha-authentication-status-get.state';
import { CaptchaAuthenticationStatusResponse } from 'src/sdk-search';

/** StateDetailsActions */
const ACTION_SET = '[CaptchaAuthenticationStatusGet] set';
const ACTION_UPDATE = '[CaptchaAuthenticationStatusGet] update';
const ACTION_RESET = '[CaptchaAuthenticationStatusGet] reset';
const ACTION_FAIL = '[CaptchaAuthenticationStatusGet] fail';
const ACTION_CANCEL_REQUEST = '[CaptchaAuthenticationStatusGet] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[CaptchaAuthenticationStatusGet] set from api';
const ACTION_UPDATE_FROM_API = '[CaptchaAuthenticationStatusGet] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setCaptchaAuthenticationStatusGet = createAction(
  ACTION_SET,
  props<WithRequestId<CaptchaAuthenticationStatusGetModel>>()
);

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateCaptchaAuthenticationStatusGet = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<CaptchaAuthenticationStatusGetModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetCaptchaAuthenticationStatusGet = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelCaptchaAuthenticationStatusGetRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failCaptchaAuthenticationStatusGet = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setCaptchaAuthenticationStatusGetFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<CaptchaAuthenticationStatusResponse>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateCaptchaAuthenticationStatusGetFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<CaptchaAuthenticationStatusGetModel>>()
);
