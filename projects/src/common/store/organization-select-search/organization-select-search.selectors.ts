import { createFeatureSelector } from '@ngrx/store';
import {
  ORGANIZATION_SELECT_SEARCH_STORE_NAME,
  OrganizationSelectSearchState,
} from './organization-select-search.state';

/** Select OrganizationSelectSearch State */
export const selectOrganizationSelectSearchState = createFeatureSelector<OrganizationSelectSearchState>(
  ORGANIZATION_SELECT_SEARCH_STORE_NAME
);
