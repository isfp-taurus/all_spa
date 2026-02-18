import { AnaBizContextModel } from '../../interfaces';
import { createAction, props } from '@ngrx/store';
import { AsyncRequest, FromApiActionPayload, WithRequestId, asyncProps } from '../common';

/** StateDetailsActions */
const ACTION_SET = '[AnaBizContext] set';
const ACTION_UPDATE = '[AnaBizContext] update';
const ACTION_RESET = '[AnaBizContext] reset';
const ACTION_FAIL = '[AnaBizContext] fail';
const ACTION_CANCEL_REQUEST = '[AnaBizContext] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[AnaBizContext] set from api';
const ACTION_UPDATE_FROM_API = '[AnaBizContext] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setAnaBizContext = createAction(ACTION_SET, props<WithRequestId<AnaBizContextModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateAnaBizContext = createAction(ACTION_UPDATE, props<WithRequestId<Partial<AnaBizContextModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetAnaBizContext = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelAnaBizContextRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failAnaBizContext = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setAnaBizContextFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<AnaBizContextModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateAnaBizContextFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<AnaBizContextModel>>()
);
