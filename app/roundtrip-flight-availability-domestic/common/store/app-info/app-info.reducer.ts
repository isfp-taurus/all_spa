import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './app-info.actions';
import { AppInfoState } from './app-info.state';

/**
 * appInfo initial state
 */
export const appInfoInitialState: AppInfoState = {
  // empty
};

/**
 * List of basic actions for AppInfo Store
 */
export const appInfoReducerFeatures: ReducerTypes<AppInfoState, ActionCreator[]>[] = [
  on(actions.setAppInfo, (_state, payload) => ({ ...payload })),

  on(actions.updateAppInfo, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetAppInfo, () => appInfoInitialState),
];

/**
 * AppInfo Store reducer
 */
export const appInfoReducer = createReducer(appInfoInitialState, ...appInfoReducerFeatures);
