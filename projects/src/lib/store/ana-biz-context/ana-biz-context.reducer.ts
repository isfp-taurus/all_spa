import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '../common';
import * as actions from './ana-biz-context.actions';
import { AnaBizContextState } from './ana-biz-context.state';

/**
 * anaBizContext initial state
 */
export const anaBizContextInitialState: AnaBizContextState = {
  authInfo: undefined,
  seamlessParameter: undefined,
  requestIds: [],
};

/**
 * List of basic actions for AnaBizContext Store
 */
export const anaBizContextReducerFeatures: ReducerTypes<AnaBizContextState, ActionCreator[]>[] = [
  on(actions.setAnaBizContext, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateAnaBizContext, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetAnaBizContext, () => anaBizContextInitialState),

  on(actions.cancelAnaBizContextRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failAnaBizContext, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setAnaBizContextFromApi, actions.updateAnaBizContextFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * AnaBizContext Store reducer
 */
export const anaBizContextReducer = createReducer(anaBizContextInitialState, ...anaBizContextReducerFeatures);
