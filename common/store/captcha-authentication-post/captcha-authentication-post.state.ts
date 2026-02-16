import { AsyncStoreItem } from '@lib/store';
import { CaptchaAuthenticationResponse } from 'src/sdk-search';

/**
 * CaptchaAuthenticationPost model
 */
export interface CaptchaAuthenticationPostModel extends CaptchaAuthenticationResponse {}

/**
 * CaptchaAuthenticationResponse model details
 */
export interface CaptchaAuthenticationPostStateDetails extends AsyncStoreItem {}

/**
 * CaptchaAuthenticationPost store state
 */
export interface CaptchaAuthenticationPostState
  extends CaptchaAuthenticationPostStateDetails,
    CaptchaAuthenticationPostModel {}

/**
 * Name of the CaptchaAuthenticationPost Store
 */
export const CAPTCHA_AUTHENTICATION_POST_STORE_NAME = 'captchaAuthenticationPost';

/**
 * CaptchaAuthenticationPost Store Interface
 */
export interface CaptchaAuthenticationPostStore {
  /** CaptchaAuthenticationPost state */
  [CAPTCHA_AUTHENTICATION_POST_STORE_NAME]: CaptchaAuthenticationPostState;
}
