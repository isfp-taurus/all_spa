import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import * as actions from './waitlist.actions';
import { WaitlistState } from './waitlist.state';
import { asyncStoreItemAdapter } from '@lib/store';

/**
 * waitlist initial state
 */
export const waitlistInitialState: WaitlistState = {
  model: null,
  requestIds: [],
};

/**
 * List of basic actions for Waitlist Store
 */
export const waitlistReducerFeatures: ReducerTypes<WaitlistState, ActionCreator[]>[] = [
  on(actions.setWaitlist, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateWaitlist, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetWaitlist, () => waitlistInitialState),

  on(actions.cancelWaitlistRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failWaitlist, (state, payload) =>
    asyncStoreItemAdapter.failRequest({ ...state, requestId: payload.requestId }, payload.requestId)
  ),

  on(actions.setWaitlistFromApi, actions.updateWaitlistFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * Waitlist Store reducer
 */
export const waitlistReducer = createReducer(waitlistInitialState, ...waitlistReducerFeatures);
