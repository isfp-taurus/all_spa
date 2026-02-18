import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './delete-prebooked-order.actions';
import { DeletePrebookedOrderState } from './delete-prebooked-order.state';

/**
 * deletePrebookedOrder initial state
 */
export const deletePrebookedOrderInitialState: DeletePrebookedOrderState = {
  requestIds: [],
};

/**
 * List of basic actions for DeletePrebookedOrder Store
 */
export const deletePrebookedOrderReducerFeatures: ReducerTypes<DeletePrebookedOrderState, ActionCreator[]>[] = [
  on(actions.setDeletePrebookedOrder, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateDeletePrebookedOrder, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetDeletePrebookedOrder, () => deletePrebookedOrderInitialState),

  on(actions.cancelDeletePrebookedOrderRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failDeletePrebookedOrder, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setDeletePrebookedOrderFromApi, actions.updateDeletePrebookedOrderFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * DeletePrebookedOrder Store reducer
 */
export const deletePrebookedOrderReducer = createReducer(
  deletePrebookedOrderInitialState,
  ...deletePrebookedOrderReducerFeatures
);
