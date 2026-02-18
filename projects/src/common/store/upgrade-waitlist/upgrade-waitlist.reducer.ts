import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './upgrade-waitlist.actions';
import { UpgradeWaitlistState } from './upgrade-waitlist.state';

/**
 * upgradeWaitlist initial state
 */
export const upgradeWaitlistInitialState: UpgradeWaitlistState = {
  requestIds: [],
};

/**
 * List of basic actions for UpgradeWaitlist Store
 */
export const upgradeWaitlistReducerFeatures: ReducerTypes<UpgradeWaitlistState, ActionCreator[]>[] = [
  on(actions.setUpgradeWaitlist, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateUpgradeWaitlist, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetUpgradeWaitlist, () => upgradeWaitlistInitialState),

  on(actions.cancelUpgradeWaitlistRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failUpgradeWaitlist, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setUpgradeWaitlistFromApi, actions.updateUpgradeWaitlistFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * UpgradeWaitlist Store reducer
 */
export const upgradeWaitlistReducer = createReducer(upgradeWaitlistInitialState, ...upgradeWaitlistReducerFeatures);
