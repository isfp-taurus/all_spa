import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './search-flight-condition-for-request.actions';
import { SearchFlightConditionForRequestState } from './search-flight-condition-for-request.state';

/**
 * searchFlightConditionForRequest initial state
 */
export const searchFlightConditionForRequestInitialState: SearchFlightConditionForRequestState = {
  requestIds: [],
  request: {
    itineraries: [],
    travelers: {
      ADT: 0,
      B15: 0,
      CHD: 0,
      INF: 0,
    },
    fare: {
      isMixedCabin: false,
    },
    searchPreferences: {
      getAirCalendarOnly: false,
      getLatestOperation: false,
    },
    displayInformation: {
      nextPage: null,
    },
    searchFormFlg: false,
  },
};

/**
 * List of basic actions for SearchFlightConditionForRequest Store
 */
export const searchFlightConditionForRequestReducerFeatures: ReducerTypes<
  SearchFlightConditionForRequestState,
  ActionCreator[]
>[] = [
  on(actions.setSearchFlightConditionForRequest, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateSearchFlightConditionForRequest, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetSearchFlightConditionForRequest, () => searchFlightConditionForRequestInitialState),

  on(actions.cancelSearchFlightConditionForRequestRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failSearchFlightConditionForRequest, (state, payload) =>
    asyncStoreItemAdapter.failRequest(state, payload.requestId)
  ),

  on(
    actions.setSearchFlightConditionForRequestFromApi,
    actions.updateSearchFlightConditionForRequestFromApi,
    (state, payload) => asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * SearchFlightConditionForRequest Store reducer
 */
export const searchFlightConditionForRequestReducer = createReducer(
  searchFlightConditionForRequestInitialState,
  ...searchFlightConditionForRequestReducerFeatures
);
