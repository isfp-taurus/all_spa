import { OrganizationSelectSearchModel } from '@common/interfaces';

/**
 * OrganizationSelectSearch store state
 */
export interface OrganizationSelectSearchState extends OrganizationSelectSearchModel {}

/**
 * Name of the OrganizationSelectSearch Store
 */
export const ORGANIZATION_SELECT_SEARCH_STORE_NAME = 'organizationSelectSearch';

/**
 * OrganizationSelectSearch Store Interface
 */
export interface OrganizationSelectSearchStore {
  /** OrganizationSelectSearch state */
  [ORGANIZATION_SELECT_SEARCH_STORE_NAME]: OrganizationSelectSearchState;
}
