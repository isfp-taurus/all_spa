import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { PlanReviewModel } from './plan-review.state';

/** StateDetailsActions */
const ACTION_SET = '[PlanReview] set';
const ACTION_UPDATE = '[PlanReview] update';
const ACTION_RESET = '[PlanReview] reset';
const ACTION_FAIL = '[PlanReview] fail';
const ACTION_CANCEL_REQUEST = '[PlanReview] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[PlanReview] set from api';
const ACTION_UPDATE_FROM_API = '[PlanReview] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setPlanReview = createAction(ACTION_SET, props<WithRequestId<PlanReviewModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updatePlanReview = createAction(ACTION_UPDATE, props<WithRequestId<Partial<PlanReviewModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetPlanReview = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelPlanReviewRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failPlanReview = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setPlanReviewFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<PlanReviewModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updatePlanReviewFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<PlanReviewModel>>()
);
