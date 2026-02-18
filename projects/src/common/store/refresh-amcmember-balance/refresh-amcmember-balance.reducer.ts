import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './refresh-amcmember-balance.actions';
import { RefreshAmcmemberBalanceState } from './refresh-amcmember-balance.state';

/**
 * refreshAmcmemberBalance initial state
 */
export const refreshAmcmemberBalanceInitialState: RefreshAmcmemberBalanceState = {
  requestIds: [],
};

/**
 * List of basic actions for RefreshAmcmemberBalance Store
 */
export const refreshAmcmemberBalanceReducerFeatures: ReducerTypes<RefreshAmcmemberBalanceState, ActionCreator[]>[] = [
  on(actions.setRefreshAmcmemberBalance, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateRefreshAmcmemberBalance, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetRefreshAmcmemberBalance, () => refreshAmcmemberBalanceInitialState),

  on(actions.cancelRefreshAmcmemberBalanceRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failRefreshAmcmemberBalance, (state, payload) =>
    asyncStoreItemAdapter.failRequest(state, payload.requestId)
  ),

  on(actions.setRefreshAmcmemberBalanceFromApi, actions.updateRefreshAmcmemberBalanceFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * RefreshAmcmemberBalance Store reducer
 */
export const refreshAmcmemberBalanceReducer = createReducer(
  refreshAmcmemberBalanceInitialState,
  ...refreshAmcmemberBalanceReducerFeatures
);
