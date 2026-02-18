import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '../common';
import { SysdateModel } from './sysdate.state';
import { Type } from 'src/sdk-sysdate';

/** StateDetailsActions */
const ACTION_SET = '[Sysdate] set';
const ACTION_RESET = '[Sysdate] reset';
const ACTION_FAIL = '[Sysdate] fail';
const ACTION_CANCEL_REQUEST = '[Sysdate] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[Sysdate] set from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setSysdate = createAction(ACTION_SET, props<WithRequestId<SysdateModel>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetSysdate = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelSysdateRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failSysdate = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setSysdateFromApi = createAction(ACTION_SET_FROM_API, asyncProps<FromApiActionPayload<Type>>());
