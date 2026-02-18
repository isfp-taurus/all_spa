import { createFeatureSelector, createSelector } from '@ngrx/store';
import { REFRESH_AMCMEMBER_BALANCE_STORE_NAME, RefreshAmcmemberBalanceState } from './refresh-amcmember-balance.state';

/** Select RefreshAmcmemberBalance State */
export const selectRefreshAmcmemberBalanceState = createFeatureSelector<RefreshAmcmemberBalanceState>(
  REFRESH_AMCMEMBER_BALANCE_STORE_NAME
);

/** Select RefreshAmcmemberBalance isPending status */
export const selectRefreshAmcmemberBalanceIsPendingStatus = createSelector(
  selectRefreshAmcmemberBalanceState,
  (state) => !!state.isPending
);

/** Select RefreshAmcmemberBalance isFailure status */
export const selectRefreshAmcmemberBalanceIsFailureStatus = createSelector(
  selectRefreshAmcmemberBalanceState,
  (state) => !!state.isFailure
);
