import { SelectCompanyAccountModel } from '@common/interfaces';
import { AsyncRequest, FromApiActionPayload, WithRequestId, asyncProps } from '@lib/store';
import { createAction, props } from '@ngrx/store';

/** StateDetailsActions */
const ACTION_SET = '[SelectCompanyAccount] set';
const ACTION_UPDATE = '[SelectCompanyAccount] update';
const ACTION_RESET = '[SelectCompanyAccount] reset';
const ACTION_FAIL = '[SelectCompanyAccount] fail';
const ACTION_CANCEL_REQUEST = '[SelectCompanyAccount] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[SelectCompanyAccount] set from api';
const ACTION_UPDATE_FROM_API = '[SelectCompanyAccount] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setSelectCompanyAccount = createAction(ACTION_SET, props<WithRequestId<SelectCompanyAccountModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateSelectCompanyAccount = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<SelectCompanyAccountModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetSelectCompanyAccount = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelSelectCompanyAccountRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failSelectCompanyAccount = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setSelectCompanyAccountFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<SelectCompanyAccountModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateSelectCompanyAccountFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<SelectCompanyAccountModel>>()
);
