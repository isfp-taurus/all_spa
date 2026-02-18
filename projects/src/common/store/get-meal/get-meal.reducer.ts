import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './get-meal.actions';
import { GetMealState } from './get-meal.state';

/**
 * getMeal initial state
 */
export const getMealInitialState: GetMealState = {
  requestIds: [],
  data: {},
};

/**
 * List of basic actions for GetMeal Store
 */
export const getMealReducerFeatures: ReducerTypes<GetMealState, ActionCreator[]>[] = [
  on(actions.setGetMeal, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateGetMeal, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetGetMeal, () => getMealInitialState),

  on(actions.cancelGetMealRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failGetMeal, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setGetMealFromApi, actions.updateGetMealFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * GetMeal Store reducer
 */
export const getMealReducer = createReducer(getMealInitialState, ...getMealReducerFeatures);
