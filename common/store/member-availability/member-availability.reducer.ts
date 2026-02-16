import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './member-availability.actions';
import { MemberAvailabilityState } from './member-availability.state';

/**
 * memberAvailability initial state
 */
export const memberAvailabilityInitialState: MemberAvailabilityState = {
  model: null,
  requestIds: [],
};

/**
 * List of basic actions for MemberAvailability Store
 */
export const memberAvailabilityReducerFeatures: ReducerTypes<MemberAvailabilityState, ActionCreator[]>[] = [
  on(actions.setMemberAvailability, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateMemberAvailability, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetMemberAvailability, () => memberAvailabilityInitialState),

  on(actions.cancelMemberAvailabilityRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failMemberAvailability, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setMemberAvailabilityFromApi, actions.updateMemberAvailabilityFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * MemberAvailability Store reducer
 */
export const memberAvailabilityReducer = createReducer(
  memberAvailabilityInitialState,
  ...memberAvailabilityReducerFeatures
);
