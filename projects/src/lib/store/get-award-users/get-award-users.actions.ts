import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '../common';
import { GetAwardUsersModel } from './get-award-users.state';

/** StateDetailsActions */
const ACTION_SET = '[GetAwardUsers] set';
const ACTION_UPDATE = '[GetAwardUsers] update';
const ACTION_RESET = '[GetAwardUsers] reset';
const ACTION_FAIL = '[GetAwardUsers] fail';
const ACTION_CANCEL_REQUEST = '[GetAwardUsers] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[GetAwardUsers] set from api';
const ACTION_UPDATE_FROM_API = '[GetAwardUsers] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setGetAwardUsers = createAction(ACTION_SET, props<WithRequestId<GetAwardUsersModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateGetAwardUsers = createAction(ACTION_UPDATE, props<WithRequestId<Partial<GetAwardUsersModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetGetAwardUsers = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelGetAwardUsersRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failGetAwardUsers = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setGetAwardUsersFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<GetAwardUsersModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateGetAwardUsersFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<GetAwardUsersModel>>()
);
