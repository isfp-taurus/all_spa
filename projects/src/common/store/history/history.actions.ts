import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { HistoryModel } from './history.state';

/** StateDetailsActions */
const ACTION_SET = '[History] set';
const ACTION_UPDATE = '[History] update';
const ACTION_RESET = '[History] reset';
const ACTION_FAIL = '[History] fail';
const ACTION_CANCEL_REQUEST = '[History] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[History] set from api';
const ACTION_UPDATE_FROM_API = '[History] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setHistory = createAction(ACTION_SET, props<WithRequestId<HistoryModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateHistory = createAction(ACTION_UPDATE, props<WithRequestId<Partial<HistoryModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetHistory = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelHistoryRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failHistory = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setHistoryFromApi = createAction(ACTION_SET_FROM_API, asyncProps<FromApiActionPayload<HistoryModel>>());

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateHistoryFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<HistoryModel>>()
);
