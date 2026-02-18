import { AuthLoginResponse } from '../../../sdk-member';
import { AsyncStoreItem } from '../common/async/async.interfaces';

/**
 * AuthLogin model
 */
export interface AuthLoginModel {
  model: AuthLoginResponse | null;
}

/**
 * AuthLoginResponse model details
 */
export interface AuthLoginStateDetails extends AsyncStoreItem {}

/**
 * AuthLogin store state
 */
export interface AuthLoginState extends AuthLoginStateDetails, AuthLoginModel {}

/**
 * Name of the AuthLogin Store
 */
export const AUTH_LOGIN_STORE_NAME = 'authLogin';

/**
 * AuthLogin Store Interface
 */
export interface AuthLoginStore {
  /** AuthLogin state */
  [AUTH_LOGIN_STORE_NAME]: AuthLoginState;
}
