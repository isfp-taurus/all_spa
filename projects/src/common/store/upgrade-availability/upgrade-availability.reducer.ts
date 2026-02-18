import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './upgrade-availability.actions';
import { UpgradeAvailabilityState } from './upgrade-availability.state';

/**
 * upgradeAvailability initial state
 */
export const upgradeAvailabilityInitialState: UpgradeAvailabilityState = {
  requestIds: [],
};

/**
 * List of basic actions for UpgradeAvailability Store
 */
export const upgradeAvailabilityReducerFeatures: ReducerTypes<UpgradeAvailabilityState, ActionCreator[]>[] = [
  on(actions.setUpgradeAvailability, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateUpgradeAvailability, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetUpgradeAvailability, () => upgradeAvailabilityInitialState),

  on(actions.cancelUpgradeAvailabilityRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failUpgradeAvailability, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setUpgradeAvailabilityFromApi, actions.updateUpgradeAvailabilityFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * UpgradeAvailability Store reducer
 */
export const upgradeAvailabilityReducer = createReducer(
  upgradeAvailabilityInitialState,
  ...upgradeAvailabilityReducerFeatures
);
