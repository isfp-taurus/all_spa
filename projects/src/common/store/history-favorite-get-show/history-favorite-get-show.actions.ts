import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { HistoryFavoriteGetShowModel } from './history-favorite-get-show.state';

/** StateDetailsActions */
const ACTION_SET = '[HistoryFavoriteGetShow] set';
const ACTION_UPDATE = '[HistoryFavoriteGetShow] update';
const ACTION_RESET = '[HistoryFavoriteGetShow] reset';
const ACTION_FAIL = '[HistoryFavoriteGetShow] fail';
const ACTION_CANCEL_REQUEST = '[HistoryFavoriteGetShow] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[HistoryFavoriteGetShow] set from api';
const ACTION_UPDATE_FROM_API = '[HistoryFavoriteGetShow] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setHistoryFavoriteGetShow = createAction(ACTION_SET, props<WithRequestId<HistoryFavoriteGetShowModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateHistoryFavoriteGetShow = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<HistoryFavoriteGetShowModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetHistoryFavoriteGetShow = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelHistoryFavoriteGetShowRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failHistoryFavoriteGetShow = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setHistoryFavoriteGetShowFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<HistoryFavoriteGetShowModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateHistoryFavoriteGetShowFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<HistoryFavoriteGetShowModel>>()
);
