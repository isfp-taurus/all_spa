import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '../common';
import * as actions from './get-award-users.actions';
import { GetAwardUsersState } from './get-award-users.state';

/**
 * getAwardUsers initial state
 */
export const getAwardUsersInitialState: GetAwardUsersState = {
  requestIds: [],
};

/**
 * List of basic actions for GetAwardUsers Store
 */
export const getAwardUsersReducerFeatures: ReducerTypes<GetAwardUsersState, ActionCreator[]>[] = [
  on(actions.setGetAwardUsers, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateGetAwardUsers, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetGetAwardUsers, () => getAwardUsersInitialState),

  on(actions.cancelGetAwardUsersRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failGetAwardUsers, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setGetAwardUsersFromApi, actions.updateGetAwardUsersFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * GetAwardUsers Store reducer
 */
export const getAwardUsersReducer = createReducer(getAwardUsersInitialState, ...getAwardUsersReducerFeatures);
