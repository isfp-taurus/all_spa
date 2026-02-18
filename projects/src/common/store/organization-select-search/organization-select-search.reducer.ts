import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './organization-select-search.actions';
import { OrganizationSelectSearchState } from './organization-select-search.state';

/**
 * organizationSelectSearch initial state
 */
export const organizationSelectSearchInitialState: OrganizationSelectSearchState = {
  // empty init
};

/**
 * List of basic actions for OrganizationSelectSearch Store
 */
export const organizationSelectSearchReducerFeatures: ReducerTypes<OrganizationSelectSearchState, ActionCreator[]>[] = [
  on(actions.setOrganizationSelectSearch, (_state, payload) => ({ ...payload })),

  on(actions.updateOrganizationSelectSearch, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetOrganizationSelectSearch, () => organizationSelectSearchInitialState),
];

/**
 * OrganizationSelectSearch Store reducer
 */
export const organizationSelectSearchReducer = createReducer(
  organizationSelectSearchInitialState,
  ...organizationSelectSearchReducerFeatures
);
