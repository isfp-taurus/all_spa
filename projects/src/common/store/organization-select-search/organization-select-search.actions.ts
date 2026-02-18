import { createAction, props } from '@ngrx/store';
import { OrganizationSelectSearchState } from './organization-select-search.state';

/** StateDetailsActions */
const ACTION_SET = '[OrganizationSelectSearch] set';
const ACTION_UPDATE = '[OrganizationSelectSearch] update';
const ACTION_RESET = '[OrganizationSelectSearch] reset';

/**
 * Clear the current store object and replace it with the new one
 */
export const setOrganizationSelectSearch = createAction(ACTION_SET, props<OrganizationSelectSearchState>());

/**
 * Change a part or the whole object in the store.
 */
export const updateOrganizationSelectSearch = createAction(
  ACTION_UPDATE,
  props<Partial<OrganizationSelectSearchState>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetOrganizationSelectSearch = createAction(ACTION_RESET);
