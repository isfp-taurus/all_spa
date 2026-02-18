import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './auth-login.actions';
import { AuthLoginState } from './auth-login.state';
import { asyncStoreItemAdapter } from '../common/async/async.adapter';

/**
 * authLogin initial state
 */
export const authLoginInitialState: AuthLoginState = {
  model: null,
  requestIds: [],
};

/**
 * List of basic actions for AuthLogin Store
 */
export const authLoginReducerFeatures: ReducerTypes<AuthLoginState, ActionCreator[]>[] = [
  on(actions.setAuthLogin, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateAuthLogin, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetAuthLogin, () => authLoginInitialState),

  on(actions.cancelAuthLoginRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failAuthLogin, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setAuthLoginFromApi, actions.updateAuthLoginFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * AuthLogin Store reducer
 */
export const authLoginReducer = createReducer(authLoginInitialState, ...authLoginReducerFeatures);
