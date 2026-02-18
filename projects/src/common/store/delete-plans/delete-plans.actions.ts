import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { DeletePlansModel } from './delete-plans.state';

/** StateDetailsActions */
const ACTION_SET = '[DeletePlans] set';
const ACTION_UPDATE = '[DeletePlans] update';
const ACTION_RESET = '[DeletePlans] reset';
const ACTION_FAIL = '[DeletePlans] fail';
const ACTION_CANCEL_REQUEST = '[DeletePlans] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[DeletePlans] set from api';
const ACTION_UPDATE_FROM_API = '[DeletePlans] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setDeletePlans = createAction(ACTION_SET, props<WithRequestId<DeletePlansModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateDeletePlans = createAction(ACTION_UPDATE, props<WithRequestId<Partial<DeletePlansModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetDeletePlans = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelDeletePlansRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failDeletePlans = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setDeletePlansFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<DeletePlansModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateDeletePlansFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<DeletePlansModel>>()
);
