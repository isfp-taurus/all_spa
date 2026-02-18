import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { PlanListModel } from './plan-list.state';

/** StateDetailsActions */
const ACTION_SET = '[PlanList] set';
const ACTION_UPDATE = '[PlanList] update';
const ACTION_RESET = '[PlanList] reset';
const ACTION_FAIL = '[PlanList] fail';
const ACTION_CANCEL_REQUEST = '[PlanList] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[PlanList] set from api';
const ACTION_UPDATE_FROM_API = '[PlanList] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setPlanList = createAction(ACTION_SET, props<WithRequestId<PlanListModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updatePlanList = createAction(ACTION_UPDATE, props<WithRequestId<Partial<PlanListModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetPlanList = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelPlanListRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failPlanList = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setPlanListFromApi = createAction(ACTION_SET_FROM_API, asyncProps<FromApiActionPayload<PlanListModel>>());

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updatePlanListFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<PlanListModel>>()
);
