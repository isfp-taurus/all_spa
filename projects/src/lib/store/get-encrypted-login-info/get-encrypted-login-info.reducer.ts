import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '../common';
import * as actions from './get-encrypted-login-info.actions';
import { GetEncryptedLoginInfoState } from './get-encrypted-login-info.state';

/**
 * getEncryptedLoginInfo initial state
 */
export const getEncryptedLoginInfoInitialState: GetEncryptedLoginInfoState = {
  model: null,
  requestIds: [],
};

/**
 * List of basic actions for GetEncryptedLoginInfo Store
 */
export const getEncryptedLoginInfoReducerFeatures: ReducerTypes<GetEncryptedLoginInfoState, ActionCreator[]>[] = [
  on(actions.setGetEncryptedLoginInfo, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateGetEncryptedLoginInfo, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetGetEncryptedLoginInfo, () => getEncryptedLoginInfoInitialState),

  on(actions.cancelGetEncryptedLoginInfoRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failGetEncryptedLoginInfo, (state, payload) =>
    asyncStoreItemAdapter.failRequest(state, payload.requestId)
  ),

  on(actions.setGetEncryptedLoginInfoFromApi, actions.updateGetEncryptedLoginInfoFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * GetEncryptedLoginInfo Store reducer
 */
export const getEncryptedLoginInfoReducer = createReducer(
  getEncryptedLoginInfoInitialState,
  ...getEncryptedLoginInfoReducerFeatures
);
