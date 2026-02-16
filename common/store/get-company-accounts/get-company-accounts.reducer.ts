import { asyncStoreItemAdapter } from '@lib/store';
import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './get-company-accounts.actions';
import { GetCompanyAccountsState } from './get-company-accounts.state';

/**
 * getCompanyAccounts initial state
 */
export const getCompanyAccountsInitialState: GetCompanyAccountsState = {
  requestIds: [],
};

/**
 * List of basic actions for GetCompanyAccounts Store
 */
export const getCompanyAccountsReducerFeatures: ReducerTypes<GetCompanyAccountsState, ActionCreator[]>[] = [
  on(actions.setGetCompanyAccounts, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateGetCompanyAccounts, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetGetCompanyAccounts, () => getCompanyAccountsInitialState),

  on(actions.cancelGetCompanyAccountsRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failGetCompanyAccounts, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setGetCompanyAccountsFromApi, actions.updateGetCompanyAccountsFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * GetCompanyAccounts Store reducer
 */
export const getCompanyAccountsReducer = createReducer(
  getCompanyAccountsInitialState,
  ...getCompanyAccountsReducerFeatures
);
