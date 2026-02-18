import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './page-loading.actions';
import { PageLoadingState } from './page-loading.state';
import { LoadingDisplayMode } from '../../interfaces';

/**
 * pageLoading initial state
 */
export const pageLoadingInitialState: PageLoadingState = {
  isLoading: false,
  loadingDisplayMode: LoadingDisplayMode.NORMAL,
};

/**
 * List of basic actions for PageLoading Store
 */
export const pageLoadingReducerFeatures: ReducerTypes<PageLoadingState, ActionCreator[]>[] = [
  on(actions.setPageLoading, (_state, payload) => ({ ...payload })),

  on(actions.updatePageLoading, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetPageLoading, () => pageLoadingInitialState),
];

/**
 * PageLoading Store reducer
 */
export const pageLoadingReducer = createReducer(pageLoadingInitialState, ...pageLoadingReducerFeatures);
