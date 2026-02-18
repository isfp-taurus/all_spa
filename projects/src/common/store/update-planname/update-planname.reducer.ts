import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './update-planname.actions';
import { UpdatePlannameState } from './update-planname.state';

/**
 * updatePlanname initial state
 */
export const updatePlannameInitialState: UpdatePlannameState = {
  requestIds: [],
};

/**
 * List of basic actions for UpdatePlanname Store
 */
export const updatePlannameReducerFeatures: ReducerTypes<UpdatePlannameState, ActionCreator[]>[] = [
  on(actions.setUpdatePlanname, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateUpdatePlanname, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetUpdatePlanname, () => updatePlannameInitialState),

  on(actions.cancelUpdatePlannameRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failUpdatePlanname, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setUpdatePlannameFromApi, actions.updateUpdatePlannameFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * UpdatePlanname Store reducer
 */
export const updatePlannameReducer = createReducer(updatePlannameInitialState, ...updatePlannameReducerFeatures);
