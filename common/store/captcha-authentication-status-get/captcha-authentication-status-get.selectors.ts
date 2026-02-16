import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  CAPTCHA_AUTHENTICATION_STATUS_GET_STORE_NAME,
  CaptchaAuthenticationStatusGetState,
} from './captcha-authentication-status-get.state';

/** Select CaptchaAuthenticationStatusGet State */
export const selectCaptchaAuthenticationStatusGetState = createFeatureSelector<CaptchaAuthenticationStatusGetState>(
  CAPTCHA_AUTHENTICATION_STATUS_GET_STORE_NAME
);

/** Select CaptchaAuthenticationStatusGet isPending status */
export const selectCaptchaAuthenticationStatusGetIsPendingStatus = createSelector(
  selectCaptchaAuthenticationStatusGetState,
  (state) => !!state.isPending
);

/** Select CaptchaAuthenticationStatusGet isFailure status */
export const selectCaptchaAuthenticationStatusGetIsFailureStatus = createSelector(
  selectCaptchaAuthenticationStatusGetState,
  (state) => !!state.isFailure
);
