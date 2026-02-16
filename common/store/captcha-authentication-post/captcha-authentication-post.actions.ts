import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { CaptchaAuthenticationPostModel } from './captcha-authentication-post.state';

/** StateDetailsActions */
const ACTION_SET = '[CaptchaAuthenticationPost] set';
const ACTION_UPDATE = '[CaptchaAuthenticationPost] update';
const ACTION_RESET = '[CaptchaAuthenticationPost] reset';
const ACTION_FAIL = '[CaptchaAuthenticationPost] fail';
const ACTION_CANCEL_REQUEST = '[CaptchaAuthenticationPost] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[CaptchaAuthenticationPost] set from api';
const ACTION_UPDATE_FROM_API = '[CaptchaAuthenticationPost] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setCaptchaAuthenticationPost = createAction(
  ACTION_SET,
  props<WithRequestId<CaptchaAuthenticationPostModel>>()
);

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateCaptchaAuthenticationPost = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<CaptchaAuthenticationPostModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetCaptchaAuthenticationPost = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelCaptchaAuthenticationPostRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failCaptchaAuthenticationPost = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setCaptchaAuthenticationPostFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<CaptchaAuthenticationPostModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateCaptchaAuthenticationPostFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<CaptchaAuthenticationPostModel>>()
);
