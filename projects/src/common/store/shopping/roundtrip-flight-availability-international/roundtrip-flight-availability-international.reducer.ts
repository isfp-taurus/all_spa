import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './roundtrip-flight-availability-international.actions';
import { RoundtripFlightAvailabilityInternationalModel } from './roundtrip-flight-availability-international.state';

/**
 * roundtripFlightAvailabilityInternational initial state
 */
export const roundtripFlightAvailabilityInternationalInitialState: RoundtripFlightAvailabilityInternationalModel = {
  requestIds: [],
};

/**
 * List of basic actions for RoundtripFlightAvailabilityInternational Store
 */
export const roundtripFlightAvailabilityInternationalReducerFeatures: ReducerTypes<
  RoundtripFlightAvailabilityInternationalModel,
  ActionCreator[]
>[] = [
  on(actions.setRoundtripFlightAvailabilityInternational, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateRoundtripFlightAvailabilityInternational, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetRoundtripFlightAvailabilityInternational, () => roundtripFlightAvailabilityInternationalInitialState),

  on(actions.cancelRoundtripFlightAvailabilityInternationalRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failRoundtripFlightAvailabilityInternational, (state, payload) =>
    asyncStoreItemAdapter.failRequest(state, payload.requestId)
  ),

  on(
    actions.setRoundtripFlightAvailabilityInternationalFromApi,
    actions.updateRoundtripFlightAvailabilityInternationalFromApi,
    (state, payload) => asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * RoundtripFlightAvailabilityInternational Store reducer
 */
export const roundtripFlightAvailabilityInternationalReducer = createReducer(
  roundtripFlightAvailabilityInternationalInitialState,
  ...roundtripFlightAvailabilityInternationalReducerFeatures
);
