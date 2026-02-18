import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  CAPTCHA_AUTHENTICATION_POST_STORE_NAME,
  CaptchaAuthenticationPostState,
} from './captcha-authentication-post.state';

/** Select CaptchaAuthenticationPost State */
export const selectCaptchaAuthenticationPostState = createFeatureSelector<CaptchaAuthenticationPostState>(
  CAPTCHA_AUTHENTICATION_POST_STORE_NAME
);

/** Select CaptchaAuthenticationPost isPending status */
export const selectCaptchaAuthenticationPostIsPendingStatus = createSelector(
  selectCaptchaAuthenticationPostState,
  (state) => !!state.isPending
);

/** Select CaptchaAuthenticationPost isFailure status */
export const selectCaptchaAuthenticationPostIsFailureStatus = createSelector(
  selectCaptchaAuthenticationPostState,
  (state) => !!state.isFailure
);
