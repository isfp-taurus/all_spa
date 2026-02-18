import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './fare-conditions.actions';
import { FareConditionsState } from './fare-conditions.state';

/**
 * fareConditions initial state
 */
export const fareConditionsInitialState: FareConditionsState = {
  requestIds: [],
  data: {},
};

/**
 * List of basic actions for FareConditions Store
 */
export const fareConditionsReducerFeatures: ReducerTypes<FareConditionsState, ActionCreator[]>[] = [
  on(actions.setFareConditions, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateFareConditions, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetFareConditions, () => fareConditionsInitialState),

  on(actions.cancelFareConditionsRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failFareConditions, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setFareConditionsFromApi, actions.updateFareConditionsFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * FareConditions Store reducer
 */
export const fareConditionsReducer = createReducer(fareConditionsInitialState, ...fareConditionsReducerFeatures);
