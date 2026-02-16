import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './captcha-authentication-post.actions';
import { CaptchaAuthenticationPostState } from './captcha-authentication-post.state';

/**
 * captchaAuthenticationPost initial state
 */
export const captchaAuthenticationPostInitialState: CaptchaAuthenticationPostState = {
  requestIds: [],
};

/**
 * List of basic actions for CaptchaAuthenticationPost Store
 */
export const captchaAuthenticationPostReducerFeatures: ReducerTypes<CaptchaAuthenticationPostState, ActionCreator[]>[] =
  [
    on(actions.setCaptchaAuthenticationPost, (state, payload) =>
      asyncStoreItemAdapter.resolveRequest(
        { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
        payload.requestId
      )
    ),

    on(actions.updateCaptchaAuthenticationPost, (state, payload) =>
      asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
    ),

    on(actions.resetCaptchaAuthenticationPost, () => captchaAuthenticationPostInitialState),

    on(actions.cancelCaptchaAuthenticationPostRequest, (state, action) =>
      asyncStoreItemAdapter.resolveRequest(state, action.requestId)
    ),

    on(actions.failCaptchaAuthenticationPost, (state, payload) =>
      asyncStoreItemAdapter.failRequest(state, payload.requestId)
    ),

    on(actions.setCaptchaAuthenticationPostFromApi, actions.updateCaptchaAuthenticationPostFromApi, (state, payload) =>
      asyncStoreItemAdapter.addRequest(state, payload.requestId)
    ),
  ];

/**
 * CaptchaAuthenticationPost Store reducer
 */
export const captchaAuthenticationPostReducer = createReducer(
  captchaAuthenticationPostInitialState,
  ...captchaAuthenticationPostReducerFeatures
);
