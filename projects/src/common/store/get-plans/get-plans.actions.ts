import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { GetPlansModel } from './get-plans.state';

/** StateDetailsActions */
const ACTION_SET = '[GetPlans] set';
const ACTION_UPDATE = '[GetPlans] update';
const ACTION_RESET = '[GetPlans] reset';
const ACTION_FAIL = '[GetPlans] fail';
const ACTION_CANCEL_REQUEST = '[GetPlans] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[GetPlans] set from api';
const ACTION_UPDATE_FROM_API = '[GetPlans] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setGetPlans = createAction(ACTION_SET, props<WithRequestId<GetPlansModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateGetPlans = createAction(ACTION_UPDATE, props<WithRequestId<Partial<GetPlansModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetGetPlans = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelGetPlansRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failGetPlans = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setGetPlansFromApi = createAction(ACTION_SET_FROM_API, asyncProps<FromApiActionPayload<GetPlansModel>>());

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateGetPlansFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<GetPlansModel>>()
);
