import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '../common';
import { AswContextModel } from '../../interfaces';
import { ChangeOfficeAndLangResponse } from 'src/sdk-user';

/** StateDetailsActions */
const ACTION_SET = '[AswContext] set';
const ACTION_UPDATE = '[AswContext] update';
const ACTION_RESET = '[AswContext] reset';
const ACTION_FAIL = '[AswContext] fail';
const ACTION_CANCEL_REQUEST = '[AswContext] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[AswContext] set from api';
const ACTION_CHANGE_OFFICE_LANG_FROM_API = '[AswContext] change office lang from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setAswContext = createAction(ACTION_SET, props<WithRequestId<AswContextModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateAswContext = createAction(ACTION_UPDATE, props<WithRequestId<Partial<AswContextModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetAswContext = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelAswContextRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failAswContext = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setAswContextFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<AswContextModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const changeOfficeAndLangFromApi = createAction(
  ACTION_CHANGE_OFFICE_LANG_FROM_API,
  asyncProps<FromApiActionPayload<ChangeOfficeAndLangResponse>>()
);
