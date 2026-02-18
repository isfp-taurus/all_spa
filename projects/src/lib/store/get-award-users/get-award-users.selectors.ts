import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GET_AWARD_USERS_STORE_NAME, GetAwardUsersState } from './get-award-users.state';

/** Select GetAwardUsers State */
export const selectGetAwardUsersState = createFeatureSelector<GetAwardUsersState>(GET_AWARD_USERS_STORE_NAME);

/** Select GetAwardUsers isPending status */
export const selectGetAwardUsersIsPendingStatus = createSelector(
  selectGetAwardUsersState,
  (state) => !!state.isPending
);

/** Select GetAwardUsers isFailure status */
export const selectGetAwardUsersIsFailureStatus = createSelector(
  selectGetAwardUsersState,
  (state) => !!state.isFailure
);
