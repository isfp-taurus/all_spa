import { AnaBizLogoutModel } from '@common/interfaces';
import { AsyncStoreItem } from '@lib/store';

/**
 * AnaBizLogoutModel model details
 */
export interface AnaBizLogoutStateDetails extends AsyncStoreItem {}

/**
 * AnaBizLogout store state
 */
export interface AnaBizLogoutState extends AnaBizLogoutStateDetails, AnaBizLogoutModel {}

/**
 * Name of the AnaBizLogout Store
 */
export const ANA_BIZ_LOGOUT_STORE_NAME = 'anaBizLogout';

/**
 * AnaBizLogout Store Interface
 */
export interface AnaBizLogoutStore {
  /** AnaBizLogout state */
  [ANA_BIZ_LOGOUT_STORE_NAME]: AnaBizLogoutState;
}
