import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { CreatePlansModel } from './create-plans.state';

/** StateDetailsActions */
const ACTION_SET = '[CreatePlans] set';
const ACTION_UPDATE = '[CreatePlans] update';
const ACTION_RESET = '[CreatePlans] reset';
const ACTION_FAIL = '[CreatePlans] fail';
const ACTION_CANCEL_REQUEST = '[CreatePlans] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[CreatePlans] set from api';
const ACTION_UPDATE_FROM_API = '[CreatePlans] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setCreatePlans = createAction(ACTION_SET, props<WithRequestId<CreatePlansModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateCreatePlans = createAction(ACTION_UPDATE, props<WithRequestId<Partial<CreatePlansModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetCreatePlans = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelCreatePlansRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failCreatePlans = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setCreatePlansFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<CreatePlansModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateCreatePlansFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<CreatePlansModel>>()
);
