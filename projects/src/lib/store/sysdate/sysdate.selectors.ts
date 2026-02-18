import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SYSDATE_STORE_NAME, SysdateState } from './sysdate.state';

/** Select Sysdate State */
export const selectSysdateState = createFeatureSelector<SysdateState>(SYSDATE_STORE_NAME);

/** Select Sysdate isFailure status */
export const selectSysdateIsFailureStatus = createSelector(selectSysdateState, (state) => !!state.isFailure);
