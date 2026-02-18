import { asyncStoreItemAdapter } from '@lib/store';
import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './select-company-account.actions';
import { SelectCompanyAccountState } from './select-company-account.state';

/**
 * selectCompanyAccount initial state
 */
export const selectCompanyAccountInitialState: SelectCompanyAccountState = {
  requestIds: [],
  data: {},
};

/**
 * List of basic actions for SelectCompanyAccount Store
 */
export const selectCompanyAccountReducerFeatures: ReducerTypes<SelectCompanyAccountState, ActionCreator[]>[] = [
  on(actions.setSelectCompanyAccount, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateSelectCompanyAccount, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetSelectCompanyAccount, () => selectCompanyAccountInitialState),

  on(actions.cancelSelectCompanyAccountRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failSelectCompanyAccount, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setSelectCompanyAccountFromApi, actions.updateSelectCompanyAccountFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * SelectCompanyAccount Store reducer
 */
export const selectCompanyAccountReducer = createReducer(
  selectCompanyAccountInitialState,
  ...selectCompanyAccountReducerFeatures
);
