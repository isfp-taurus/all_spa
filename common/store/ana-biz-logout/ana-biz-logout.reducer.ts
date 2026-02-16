import { asyncStoreItemAdapter } from '@lib/store';
import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './ana-biz-logout.actions';
import { AnaBizLogoutState } from './ana-biz-logout.state';

/**
 * anaBizLogout initial state
 */
export const anaBizLogoutInitialState: AnaBizLogoutState = {
  warnings: undefined,
  requestIds: [],
};

/**
 * List of basic actions for AnaBizLogout Store
 */
export const anaBizLogoutReducerFeatures: ReducerTypes<AnaBizLogoutState, ActionCreator[]>[] = [
  on(actions.setAnaBizLogout, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateAnaBizLogout, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetAnaBizLogout, () => anaBizLogoutInitialState),

  on(actions.cancelAnaBizLogoutRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failAnaBizLogout, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setAnaBizLogoutFromApi, actions.updateAnaBizLogoutFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * AnaBizLogout Store reducer
 */
export const anaBizLogoutReducer = createReducer(anaBizLogoutInitialState, ...anaBizLogoutReducerFeatures);
