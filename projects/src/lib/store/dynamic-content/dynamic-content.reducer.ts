import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './dynamic-content.actions';
import { DynamicContentState } from './dynamic-content.state';

/**
 * dynamicContent initial state
 */
export const dynamicContentInitialState: DynamicContentState = {
  pageInfo: null,
  subPageInfo: null,
};

/**
 * List of basic actions for DynamicContent Store
 */
export const dynamicContentReducerFeatures: ReducerTypes<DynamicContentState, ActionCreator[]>[] = [
  on(actions.setPageDynamicContent, (state, payload) => ({ subPageInfo: state.subPageInfo, pageInfo: { ...payload } })),

  on(actions.resetPageDynamicContent, (state) => ({ subPageInfo: state.subPageInfo, pageInfo: {} })),

  on(actions.setSubPageDynamicContent, (state, payload) => ({ pageInfo: state.pageInfo, subPageInfo: payload })),

  on(actions.resetSubPageDynamicContent, (state) => ({ pageInfo: state.pageInfo, subPageInfo: {} })),

  on(actions.resetAllDynamicContent, () => dynamicContentInitialState),
];

/**
 * DynamicContent Store reducer
 */
export const dynamicContentReducer = createReducer(dynamicContentInitialState, ...dynamicContentReducerFeatures);
