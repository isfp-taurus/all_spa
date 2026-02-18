import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { CurrentPlanModel } from './current-plan.state';

/** StateDetailsActions */
const ACTION_SET = '[CurrentPlan] set';
const ACTION_UPDATE = '[CurrentPlan] update';
const ACTION_RESET = '[CurrentPlan] reset';
const ACTION_FAIL = '[CurrentPlan] fail';
const ACTION_CANCEL_REQUEST = '[CurrentPlan] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[CurrentPlan] set from api';
const ACTION_UPDATE_FROM_API = '[CurrentPlan] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setCurrentPlan = createAction(ACTION_SET, props<WithRequestId<CurrentPlanModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateCurrentPlan = createAction(ACTION_UPDATE, props<WithRequestId<Partial<CurrentPlanModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetCurrentPlan = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelCurrentPlanRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failCurrentPlan = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setCurrentPlanFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<CurrentPlanModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateCurrentPlanFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<CurrentPlanModel>>()
);
