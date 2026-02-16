import { asyncStoreItemAdapter } from '@lib/store';
import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './ana-biz-login.actions';
import { AnaBizLoginState } from './ana-biz-login.state';

/**
 * anaBizLogin initial state
 */
export const anaBizLoginInitialState: AnaBizLoginState = {
  warnings: undefined,
  data: {},
  requestIds: [],
};

/**
 * List of basic actions for AnaBizLogin Store
 */
export const anaBizLoginReducerFeatures: ReducerTypes<AnaBizLoginState, ActionCreator[]>[] = [
  on(actions.setAnaBizLogin, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateAnaBizLogin, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetAnaBizLogin, () => anaBizLoginInitialState),

  on(actions.cancelAnaBizLoginRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failAnaBizLogin, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setAnaBizLoginFromApi, actions.updateAnaBizLoginFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * AnaBizLogin Store reducer
 */
export const anaBizLoginReducer = createReducer(anaBizLoginInitialState, ...anaBizLoginReducerFeatures);
