import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GET_MEMBER_INFORMATION_STORE_NAME, GetMemberInformationState } from './get-member-information.state';

/** Select GetMemberInformation State */
export const selectGetMemberInformationState = createFeatureSelector<GetMemberInformationState>(
  GET_MEMBER_INFORMATION_STORE_NAME
);

/** Select GetMemberInformation isPending status */
export const selectGetMemberInformationIsPendingStatus = createSelector(
  selectGetMemberInformationState,
  (state) => !!state.isPending
);

/** Select GetMemberInformation isFailure status */
export const selectGetMemberInformationIsFailureStatus = createSelector(
  selectGetMemberInformationState,
  (state) => !!state.isFailure
);
