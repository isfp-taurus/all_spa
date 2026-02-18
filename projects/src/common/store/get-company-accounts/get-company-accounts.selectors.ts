import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GET_COMPANY_ACCOUNTS_STORE_NAME, GetCompanyAccountsState } from './get-company-accounts.state';

/** Select GetCompanyAccounts State */
export const selectGetCompanyAccountsState = createFeatureSelector<GetCompanyAccountsState>(
  GET_COMPANY_ACCOUNTS_STORE_NAME
);

/** Select GetCompanyAccounts isPending status */
export const selectGetCompanyAccountsIsPendingStatus = createSelector(
  selectGetCompanyAccountsState,
  (state) => !!state.isPending
);

/** Select GetCompanyAccounts isFailure status */
export const selectGetCompanyAccountsIsFailureStatus = createSelector(
  selectGetCompanyAccountsState,
  (state) => !!state.isFailure
);
