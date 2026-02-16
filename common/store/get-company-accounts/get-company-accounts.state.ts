import { GetCompanyAccountsModel } from '@common/interfaces';
import { AsyncStoreItem } from '@lib/store';

/**
 * GetCompanyAccountsModel model details
 */
export interface GetCompanyAccountsStateDetails extends AsyncStoreItem {}

/**
 * GetCompanyAccounts store state
 */
export interface GetCompanyAccountsState extends GetCompanyAccountsStateDetails, GetCompanyAccountsModel {}

/**
 * Name of the GetCompanyAccounts Store
 */
export const GET_COMPANY_ACCOUNTS_STORE_NAME = 'getCompanyAccounts';

/**
 * GetCompanyAccounts Store Interface
 */
export interface GetCompanyAccountsStore {
  /** GetCompanyAccounts state */
  [GET_COMPANY_ACCOUNTS_STORE_NAME]: GetCompanyAccountsState;
}
