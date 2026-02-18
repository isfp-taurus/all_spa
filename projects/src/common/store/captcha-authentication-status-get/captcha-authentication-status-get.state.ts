import { AsyncStoreItem } from '@lib/store';
import { CaptchaAuthenticationStatusResponse } from 'src/sdk-search';

/**
 * CaptchaAuthenticationStatusGet model
 */
export interface CaptchaAuthenticationStatusGetModel extends CaptchaAuthenticationStatusResponse {
  model: CaptchaAuthenticationStatusResponse | null;
}

/**
 * CaptchaAuthenticationStatusResponse model details
 */
export interface CaptchaAuthenticationStatusGetStateDetails extends AsyncStoreItem {}

/**
 * CaptchaAuthenticationStatusGet store state
 */
export interface CaptchaAuthenticationStatusGetState
  extends CaptchaAuthenticationStatusGetStateDetails,
    CaptchaAuthenticationStatusGetModel {}

/**
 * Name of the CaptchaAuthenticationStatusGet Store
 */
export const CAPTCHA_AUTHENTICATION_STATUS_GET_STORE_NAME = 'captchaAuthenticationStatusGet';

/**
 * CaptchaAuthenticationStatusGet Store Interface
 */
export interface CaptchaAuthenticationStatusGetStore {
  /** CaptchaAuthenticationStatusGet state */
  [CAPTCHA_AUTHENTICATION_STATUS_GET_STORE_NAME]: CaptchaAuthenticationStatusGetState;
}
