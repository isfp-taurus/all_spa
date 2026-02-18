import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './not-retryable-error.actions';
import { NotRetryableErrorState } from './not-retryable-error.state';

/**
 * notRetryableError initial state
 */
export const notRetryableErrorInitialState: NotRetryableErrorState = {
  model: null,
};

/**
 * List of basic actions for NotRetryableError Store
 */
export const notRetryableErrorReducerFeatures: ReducerTypes<NotRetryableErrorState, ActionCreator[]>[] = [
  on(actions.setNotRetryableError, (_state, payload) => ({ ...{ model: payload } })),

  on(actions.resetNotRetryableError, () => notRetryableErrorInitialState),
];

/**
 * NotRetryableError Store reducer
 */
export const notRetryableErrorReducer = createReducer(
  notRetryableErrorInitialState,
  ...notRetryableErrorReducerFeatures
);
