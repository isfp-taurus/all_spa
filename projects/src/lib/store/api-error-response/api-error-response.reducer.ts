import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './api-error-response.actions';
import { ApiErrorResponseState } from './api-error-response.state';

/**
 * apiErrorResponse initial state
 */
export const apiErrorResponseInitialState: ApiErrorResponseState = {
  model: null,
};

/**
 * List of basic actions for ApiErrorResponse Store
 */
export const apiErrorResponseReducerFeatures: ReducerTypes<ApiErrorResponseState, ActionCreator[]>[] = [
  on(actions.setApiErrorResponse, (_state, payload) => ({ ...{ model: payload } })),

  on(actions.updateApiErrorResponse, (state, payload) => ({ ...state, ...{ model: payload } })),

  on(actions.resetApiErrorResponse, () => apiErrorResponseInitialState),
];

/**
 * ApiErrorResponse Store reducer
 */
export const apiErrorResponseReducer = createReducer(apiErrorResponseInitialState, ...apiErrorResponseReducerFeatures);
