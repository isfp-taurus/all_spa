import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GET_ENCRYPTED_LOGIN_INFO_STORE_NAME, GetEncryptedLoginInfoState } from './get-encrypted-login-info.state';

/** Select GetEncryptedLoginInfo State */
export const selectGetEncryptedLoginInfoState = createFeatureSelector<GetEncryptedLoginInfoState>(
  GET_ENCRYPTED_LOGIN_INFO_STORE_NAME
);

/** Select GetEncryptedLoginInfo isPending status */
export const selectGetEncryptedLoginInfoIsPendingStatus = createSelector(
  selectGetEncryptedLoginInfoState,
  (state) => !!state.isPending
);

/** Select GetEncryptedLoginInfo isFailure status */
export const selectGetEncryptedLoginInfoIsFailureStatus = createSelector(
  selectGetEncryptedLoginInfoState,
  (state) => !!state.isFailure
);
