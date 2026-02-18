import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { GetEstimationModel } from './get-estimation.state';

/** StateDetailsActions */
const ACTION_SET = '[GetEstimation] set';
const ACTION_UPDATE = '[GetEstimation] update';
const ACTION_RESET = '[GetEstimation] reset';
const ACTION_FAIL = '[GetEstimation] fail';
const ACTION_CANCEL_REQUEST = '[GetEstimation] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[GetEstimation] set from api';
const ACTION_UPDATE_FROM_API = '[GetEstimation] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setGetEstimation = createAction(ACTION_SET, props<WithRequestId<GetEstimationModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateGetEstimation = createAction(ACTION_UPDATE, props<WithRequestId<Partial<GetEstimationModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetGetEstimation = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelGetEstimationRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failGetEstimation = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setGetEstimationFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<GetEstimationModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateGetEstimationFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<GetEstimationModel>>()
);
