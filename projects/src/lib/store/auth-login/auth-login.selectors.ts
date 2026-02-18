import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AUTH_LOGIN_STORE_NAME, AuthLoginState } from './auth-login.state';

/** Select AuthLogin State */
export const selectAuthLoginState = createFeatureSelector<AuthLoginState>(AUTH_LOGIN_STORE_NAME);

/** Select AuthLogin isPending status */
export const selectAuthLoginIsPendingStatus = createSelector(selectAuthLoginState, (state) => !!state.isPending);

/** Select AuthLogin isFailure status */
export const selectAuthLoginIsFailureStatus = createSelector(selectAuthLoginState, (state) => !!state.isFailure);
