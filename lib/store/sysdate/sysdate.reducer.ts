import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '../common';
import * as actions from './sysdate.actions';
import { SysdateState } from './sysdate.state';

/**
 * sysdate initial state
 */
export const sysdateInitialState: SysdateState = {
  model: null,
  requestIds: [],
};

/**
 * List of basic actions for Sysdate Store
 */
export const sysdateReducerFeatures: ReducerTypes<SysdateState, ActionCreator[]>[] = [
  on(actions.setSysdate, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.resetSysdate, () => sysdateInitialState),

  on(actions.cancelSysdateRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failSysdate, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),
];

/**
 * Sysdate Store reducer
 */
export const sysdateReducer = createReducer(sysdateInitialState, ...sysdateReducerFeatures);
