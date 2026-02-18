import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ANA_BIZ_LOGOUT_STORE_NAME, AnaBizLogoutState } from './ana-biz-logout.state';

/** Select AnaBizLogout State */
export const selectAnaBizLogoutState = createFeatureSelector<AnaBizLogoutState>(ANA_BIZ_LOGOUT_STORE_NAME);

/** Select AnaBizLogout isPending status */
export const selectAnaBizLogoutIsPendingStatus = createSelector(selectAnaBizLogoutState, (state) => !!state.isPending);

/** Select AnaBizLogout isFailure status */
export const selectAnaBizLogoutIsFailureStatus = createSelector(selectAnaBizLogoutState, (state) => !!state.isFailure);
