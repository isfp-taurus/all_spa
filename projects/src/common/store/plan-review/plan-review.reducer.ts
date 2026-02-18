import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './plan-review.actions';
import { PlanReviewState } from './plan-review.state';

/**
 * planReview initial state
 */
export const planReviewInitialState: PlanReviewState = {
  requestIds: [],
  previousPage: '',
  isNeedRefresh: false,
  isRightOffice: false,
  isHkKrAgreed: false,
  isPlanChanged: false,
  isAllReadyToShow: false,
  upsellStatus: {
    isOutboundUpselled: false,
    isInboundUpselled: false,
    primaryAirOfferId: '',
  },
};

/**
 * List of basic actions for PlanReview Store
 */
export const planReviewReducerFeatures: ReducerTypes<PlanReviewState, ActionCreator[]>[] = [
  on(actions.setPlanReview, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest(
      { ...asyncStoreItemAdapter.extractAsyncStoreItem(state), ...payload },
      payload.requestId
    )
  ),

  on(actions.updatePlanReview, (state, payload) =>
    asyncStoreItemAdapter.resolveRequest({ ...state, ...payload }, payload.requestId)
  ),

  on(actions.resetPlanReview, () => planReviewInitialState),

  on(actions.cancelPlanReviewRequest, (state, action) => asyncStoreItemAdapter.resolveRequest(state, action.requestId)),

  on(actions.failPlanReview, (state, payload) => asyncStoreItemAdapter.failRequest(state, payload.requestId)),

  on(actions.setPlanReviewFromApi, actions.updatePlanReviewFromApi, (state, payload) =>
    asyncStoreItemAdapter.addRequest(state, payload.requestId)
  ),
];

/**
 * PlanReview Store reducer
 */
export const planReviewReducer = createReducer(planReviewInitialState, ...planReviewReducerFeatures);
