import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './captcha-authentication-status-get.actions';
import { CaptchaAuthenticationStatusGetState } from './captcha-authentication-status-get.state';

/**
 * captchaAuthenticationStatusGet initial state
 */
export const captchaAuthenticationStatusGetInitialState: CaptchaAuthenticationStatusGetState = {
  model: null,
  requestIds: [],
};

/**
 * List of basic actions for CaptchaAuthenticationStatusGet Store
 */
export const captchaAuthenticationStatusGetReducerFeatures: ReducerTypes<
  CaptchaAuthenticationStatusGetState,
  ActionCreator[]
>[] = [
  on(actions.setCaptchaAuthenticationStatusGet, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateCaptchaAuthenticationStatusGet, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetCaptchaAuthenticationStatusGet, () => captchaAuthenticationStatusGetInitialState),

  on(actions.cancelCaptchaAuthenticationStatusGetRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failCaptchaAuthenticationStatusGet, (state, payload) =>
    asyncStoreItemAdapter.failRequest(state, payload.requestId)
  ),

  on(
    actions.setCaptchaAuthenticationStatusGetFromApi,
    actions.updateCaptchaAuthenticationStatusGetFromApi,
    (state, payload) => asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * CaptchaAuthenticationStatusGet Store reducer
 */
export const captchaAuthenticationStatusGetReducer = createReducer(
  captchaAuthenticationStatusGetInitialState,
  ...captchaAuthenticationStatusGetReducerFeatures
);
