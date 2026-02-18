import { AnaBizLoginModel } from '@common/interfaces';
import { AsyncStoreItem } from '@lib/store';

/**
 * AnaBizLoginModel model details
 */
export interface AnaBizLoginStateDetails extends AsyncStoreItem {}

/**
 * AnaBizLogin store state
 */
export interface AnaBizLoginState extends AnaBizLoginStateDetails, AnaBizLoginModel {}

/**
 * Name of the AnaBizLogin Store
 */
export const ANA_BIZ_LOGIN_STORE_NAME = 'anaBizLogin';

/**
 * AnaBizLogin Store Interface
 */
export interface AnaBizLoginStore {
  /** AnaBizLogin state */
  [ANA_BIZ_LOGIN_STORE_NAME]: AnaBizLoginState;
}
