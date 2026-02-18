import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { HistoryFavoriteDeleteModel } from './history-favorite-delete.state';

/** StateDetailsActions */
const ACTION_SET = '[HistoryFavoriteDelete] set';
const ACTION_UPDATE = '[HistoryFavoriteDelete] update';
const ACTION_RESET = '[HistoryFavoriteDelete] reset';
const ACTION_FAIL = '[HistoryFavoriteDelete] fail';
const ACTION_CANCEL_REQUEST = '[HistoryFavoriteDelete] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[HistoryFavoriteDelete] set from api';
const ACTION_UPDATE_FROM_API = '[HistoryFavoriteDelete] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setHistoryFavoriteDelete = createAction(ACTION_SET, props<WithRequestId<HistoryFavoriteDeleteModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateHistoryFavoriteDelete = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<HistoryFavoriteDeleteModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetHistoryFavoriteDelete = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelHistoryFavoriteDeleteRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failHistoryFavoriteDelete = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setHistoryFavoriteDeleteFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<HistoryFavoriteDeleteModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateHistoryFavoriteDeleteFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<HistoryFavoriteDeleteModel>>()
);
