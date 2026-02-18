import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ANA_BIZ_LOGIN_STORE_NAME, AnaBizLoginState } from './ana-biz-login.state';

/** Select AnaBizLogin State */
export const selectAnaBizLoginState = createFeatureSelector<AnaBizLoginState>(ANA_BIZ_LOGIN_STORE_NAME);

/** Select AnaBizLogin isPending status */
export const selectAnaBizLoginIsPendingStatus = createSelector(selectAnaBizLoginState, (state) => !!state.isPending);

/** Select AnaBizLogin isFailure status */
export const selectAnaBizLoginIsFailureStatus = createSelector(selectAnaBizLoginState, (state) => !!state.isFailure);
