import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SELECT_COMPANY_ACCOUNT_STORE_NAME, SelectCompanyAccountState } from './select-company-account.state';

/** Select SelectCompanyAccount State */
export const selectSelectCompanyAccountState = createFeatureSelector<SelectCompanyAccountState>(
  SELECT_COMPANY_ACCOUNT_STORE_NAME
);

/** Select SelectCompanyAccount isPending status */
export const selectSelectCompanyAccountIsPendingStatus = createSelector(
  selectSelectCompanyAccountState,
  (state) => !!state.isPending
);

/** Select SelectCompanyAccount isFailure status */
export const selectSelectCompanyAccountIsFailureStatus = createSelector(
  selectSelectCompanyAccountState,
  (state) => !!state.isFailure
);
