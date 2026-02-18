import { HistoryFavoriteGetResponse } from 'src/sdk-search/model/historyFavoriteGetResponse';
import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { HistoryFavoriteGetResponseModel } from './history-favorite-get-response.state';

/** StateDetailsActions */
const ACTION_SET = '[HistoryFavoriteGetResponse] set';
const ACTION_UPDATE = '[HistoryFavoriteGetResponse] update';
const ACTION_RESET = '[HistoryFavoriteGetResponse] reset';
const ACTION_FAIL = '[HistoryFavoriteGetResponse] fail';
const ACTION_CANCEL_REQUEST = '[HistoryFavoriteGetResponse] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[HistoryFavoriteGetResponse] set from api';
const ACTION_UPDATE_FROM_API = '[HistoryFavoriteGetResponse] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setHistoryFavoriteGetResponse = createAction(
  ACTION_SET,
  props<WithRequestId<HistoryFavoriteGetResponseModel>>()
);

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateHistoryFavoriteGetResponse = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<HistoryFavoriteGetResponseModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetHistoryFavoriteGetResponse = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelHistoryFavoriteGetResponseRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failHistoryFavoriteGetResponse = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setHistoryFavoriteGetResponseFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<HistoryFavoriteGetResponse>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateHistoryFavoriteGetResponseFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<HistoryFavoriteGetResponse>>()
);
