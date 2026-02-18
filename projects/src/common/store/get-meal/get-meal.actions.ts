import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { GetMealModel } from './get-meal.state';

/** StateDetailsActions */
const ACTION_SET = '[GetMeal] set';
const ACTION_UPDATE = '[GetMeal] update';
const ACTION_RESET = '[GetMeal] reset';
const ACTION_FAIL = '[GetMeal] fail';
const ACTION_CANCEL_REQUEST = '[GetMeal] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[GetMeal] set from api';
const ACTION_UPDATE_FROM_API = '[GetMeal] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setGetMeal = createAction(ACTION_SET, props<WithRequestId<GetMealModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateGetMeal = createAction(ACTION_UPDATE, props<WithRequestId<Partial<GetMealModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetGetMeal = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelGetMealRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failGetMeal = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setGetMealFromApi = createAction(ACTION_SET_FROM_API, asyncProps<FromApiActionPayload<GetMealModel>>());

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateGetMealFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<GetMealModel>>()
);
