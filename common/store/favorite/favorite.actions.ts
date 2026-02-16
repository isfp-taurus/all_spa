import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { FavoriteModel } from './favorite.state';

/** StateDetailsActions */
const ACTION_SET = '[Favorite] set';
const ACTION_UPDATE = '[Favorite] update';
const ACTION_RESET = '[Favorite] reset';
const ACTION_FAIL = '[Favorite] fail';
const ACTION_CANCEL_REQUEST = '[Favorite] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[Favorite] set from api';
const ACTION_UPDATE_FROM_API = '[Favorite] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setFavorite = createAction(ACTION_SET, props<WithRequestId<FavoriteModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateFavorite = createAction(ACTION_UPDATE, props<WithRequestId<Partial<FavoriteModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetFavorite = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelFavoriteRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failFavorite = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setFavoriteFromApi = createAction(ACTION_SET_FROM_API, asyncProps<FromApiActionPayload<FavoriteModel>>());

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateFavoriteFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<FavoriteModel>>()
);
