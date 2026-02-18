import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './confidential.actions';
import { ConfidentialState } from './confidential.state';

/**
 * confidential initial state
 */
export const confidentialInitialState: ConfidentialState = {};

/**
 * List of basic actions for confidential Store
 */
export const confidentialReducerFeatures: ReducerTypes<ConfidentialState, ActionCreator[]>[] = [
  on(actions.setConfidential, (state, payload) => ({ ...payload })),

  on(actions.updateConfidential, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetConfidential, () => confidentialInitialState),
];

/**
 * Confidential Store reducer
 */
export const confidentialReducer = createReducer(confidentialInitialState, ...confidentialReducerFeatures);
