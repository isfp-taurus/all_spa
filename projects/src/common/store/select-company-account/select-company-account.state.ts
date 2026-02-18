import { SelectCompanyAccountModel } from '@common/interfaces';
import { AsyncStoreItem } from '@lib/store';

/**
 * SelectCompanyAccountModel model details
 */
export interface SelectCompanyAccountStateDetails extends AsyncStoreItem {}

/**
 * SelectCompanyAccount store state
 */
export interface SelectCompanyAccountState extends SelectCompanyAccountStateDetails, SelectCompanyAccountModel {}

/**
 * Name of the SelectCompanyAccount Store
 */
export const SELECT_COMPANY_ACCOUNT_STORE_NAME = 'selectCompanyAccount';

/**
 * SelectCompanyAccount Store Interface
 */
export interface SelectCompanyAccountStore {
  /** SelectCompanyAccount state */
  [SELECT_COMPANY_ACCOUNT_STORE_NAME]: SelectCompanyAccountState;
}
