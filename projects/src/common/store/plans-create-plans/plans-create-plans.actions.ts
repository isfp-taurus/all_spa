import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { PlansCreatePlansModel } from './plans-create-plans.state';

/** StateDetailsActions */
const ACTION_SET = '[PlansCreatePlans] set';
const ACTION_UPDATE = '[PlansCreatePlans] update';
const ACTION_RESET = '[PlansCreatePlans] reset';
const ACTION_FAIL = '[PlansCreatePlans] fail';
const ACTION_CANCEL_REQUEST = '[PlansCreatePlans] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[PlansCreatePlans] set from api';
const ACTION_UPDATE_FROM_API = '[PlansCreatePlans] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setPlansCreatePlans = createAction(ACTION_SET, props<WithRequestId<PlansCreatePlansModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updatePlansCreatePlans = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<PlansCreatePlansModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetPlansCreatePlans = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelPlansCreatePlansRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failPlansCreatePlans = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setPlansCreatePlansFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<PlansCreatePlansModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updatePlansCreatePlansFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<PlansCreatePlansModel>>()
);
