import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './retryable-error.actions';
import { RetryableErrorState } from './retryable-error.state';

/**
 * retryableError initial state
 */
export const retryableErrorInitialState: RetryableErrorState = {
  pageInfo: null,
  subPageInfo: null,
};

/**
 * List of basic actions for RetryableError Store
 */
export const retryableErrorReducerFeatures: ReducerTypes<RetryableErrorState, ActionCreator[]>[] = [
  on(actions.setPageRetryableError, (_state, payload) => ({
    subPageInfo: _state.subPageInfo,
    pageInfo: { ...payload },
  })),

  on(actions.resetPageRetryableError, (_state) => ({ subPageInfo: _state.subPageInfo, pageInfo: null })),

  on(actions.setSubPageRetryableError, (_state, payload) => ({
    pageInfo: _state.pageInfo,
    subPageInfo: { ...payload },
  })),

  on(actions.resetSubPageRetryableError, (_state) => ({ pageInfo: _state.pageInfo, subPageInfo: null })),

  on(actions.resetAllRetryableError, () => retryableErrorInitialState),
];

/**
 * RetryableError Store reducer
 */
export const retryableErrorReducer = createReducer(retryableErrorInitialState, ...retryableErrorReducerFeatures);
