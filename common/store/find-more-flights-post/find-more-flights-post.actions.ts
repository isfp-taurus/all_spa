import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { FindMoreFlightsPostModel } from './find-more-flights-post.state';

/** StateDetailsActions */
const ACTION_SET = '[FindMoreFlightsPost] set';
const ACTION_UPDATE = '[FindMoreFlightsPost] update';
const ACTION_RESET = '[FindMoreFlightsPost] reset';
const ACTION_FAIL = '[FindMoreFlightsPost] fail';
const ACTION_CANCEL_REQUEST = '[FindMoreFlightsPost] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[FindMoreFlightsPost] set from api';
const ACTION_UPDATE_FROM_API = '[FindMoreFlightsPost] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setFindMoreFlightsPost = createAction(ACTION_SET, props<WithRequestId<FindMoreFlightsPostModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateFindMoreFlightsPost = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<FindMoreFlightsPostModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetFindMoreFlightsPost = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelFindMoreFlightsPostRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failFindMoreFlightsPost = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setFindMoreFlightsPostFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<FindMoreFlightsPostModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateFindMoreFlightsPostFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<FindMoreFlightsPostModel>>()
);
