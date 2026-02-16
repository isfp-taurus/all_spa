import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { FavoritePostModel } from './favorite-post.state';

/** StateDetailsActions */
const ACTION_SET = '[FavoritePost] set';
const ACTION_UPDATE = '[FavoritePost] update';
const ACTION_RESET = '[FavoritePost] reset';
const ACTION_FAIL = '[FavoritePost] fail';
const ACTION_CANCEL_REQUEST = '[FavoritePost] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[FavoritePost] set from api';
const ACTION_UPDATE_FROM_API = '[FavoritePost] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setFavoritePost = createAction(ACTION_SET, props<WithRequestId<FavoritePostModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateFavoritePost = createAction(ACTION_UPDATE, props<WithRequestId<Partial<FavoritePostModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetFavoritePost = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelFavoritePostRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failFavoritePost = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setFavoritePostFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<FavoritePostModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateFavoritePostFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<FavoritePostModel>>()
);
