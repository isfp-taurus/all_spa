import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './find-more-flights-post.actions';
import { FindMoreFlightsPostState } from './find-more-flights-post.state';

/**
 * FindMoreFlightsPost initial state
 */
export const FindMoreFlightsPostInitialState: FindMoreFlightsPostState = {
  requestIds: [],
};

/**
 * List of basic actions for FindMoreFlightsPost Store
 */
export const FindMoreFlightsPostReducerFeatures: ReducerTypes<FindMoreFlightsPostState, ActionCreator[]>[] = [
  on(actions.setFindMoreFlightsPost, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updateFindMoreFlightsPost, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetFindMoreFlightsPost, () => FindMoreFlightsPostInitialState),

  on(actions.cancelFindMoreFlightsPostRequest, (state, action) =>
    asyncStoreItemAdapter.resolveRequest(state, action.requestId)
  ),

  on(actions.failFindMoreFlightsPost, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setFindMoreFlightsPostFromApi, actions.updateFindMoreFlightsPostFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * FindMoreFlightsPost Store reducer
 */
export const FindMoreFlightsPostReducer = createReducer(
  FindMoreFlightsPostInitialState,
  ...FindMoreFlightsPostReducerFeatures
);
