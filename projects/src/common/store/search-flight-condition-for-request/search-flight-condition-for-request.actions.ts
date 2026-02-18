import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { SearchFlightConditionForRequestModel } from './search-flight-condition-for-request.state';

/** StateDetailsActions */
const ACTION_SET = '[SearchFlightConditionForRequest] set';
const ACTION_UPDATE = '[SearchFlightConditionForRequest] update';
const ACTION_RESET = '[SearchFlightConditionForRequest] reset';
const ACTION_FAIL = '[SearchFlightConditionForRequest] fail';
const ACTION_CANCEL_REQUEST = '[SearchFlightConditionForRequest] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[SearchFlightConditionForRequest] set from api';
const ACTION_UPDATE_FROM_API = '[SearchFlightConditionForRequest] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setSearchFlightConditionForRequest = createAction(
  ACTION_SET,
  props<WithRequestId<SearchFlightConditionForRequestModel>>()
);

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateSearchFlightConditionForRequest = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<SearchFlightConditionForRequestModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetSearchFlightConditionForRequest = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelSearchFlightConditionForRequestRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failSearchFlightConditionForRequest = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setSearchFlightConditionForRequestFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<SearchFlightConditionForRequestModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateSearchFlightConditionForRequestFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<SearchFlightConditionForRequestModel>>()
);
