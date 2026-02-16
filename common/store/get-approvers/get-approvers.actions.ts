import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { GetApproversModel } from './get-approvers.state';

/** StateDetailsActions */
const ACTION_SET = '[GetApprovers] set';
const ACTION_UPDATE = '[GetApprovers] update';
const ACTION_RESET = '[GetApprovers] reset';
const ACTION_FAIL = '[GetApprovers] fail';
const ACTION_CANCEL_REQUEST = '[GetApprovers] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[GetApprovers] set from api';
const ACTION_UPDATE_FROM_API = '[GetApprovers] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setGetApprovers = createAction(ACTION_SET, props<WithRequestId<GetApproversModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateGetApprovers = createAction(ACTION_UPDATE, props<WithRequestId<Partial<GetApproversModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetGetApprovers = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelGetApproversRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failGetApprovers = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setGetApproversFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<GetApproversModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateGetApproversFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<GetApproversModel>>()
);
