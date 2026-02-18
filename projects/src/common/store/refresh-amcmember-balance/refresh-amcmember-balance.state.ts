import { AsyncStoreItem } from '@lib/store';
import { RefreshAmcmemberBalanceResponse } from 'src/sdk-authorization';

/**
 * RefreshAmcmemberBalance model
 */
export interface RefreshAmcmemberBalanceModel extends RefreshAmcmemberBalanceResponse {}

/**
 * RefreshAmcmemberBalanceResponse model details
 */
export interface RefreshAmcmemberBalanceStateDetails extends AsyncStoreItem, RefreshAmcmemberBalanceModel {}

/**
 * RefreshAmcmemberBalance store state
 */
export interface RefreshAmcmemberBalanceState extends RefreshAmcmemberBalanceStateDetails {}

/**
 * Name of the RefreshAmcmemberBalance Store
 */
export const REFRESH_AMCMEMBER_BALANCE_STORE_NAME = 'refreshAmcmemberBalance';

/**
 * RefreshAmcmemberBalance Store Interface
 */
export interface RefreshAmcmemberBalanceStore {
  /** RefreshAmcmemberBalance state */
  [REFRESH_AMCMEMBER_BALANCE_STORE_NAME]: RefreshAmcmemberBalanceState;
}
