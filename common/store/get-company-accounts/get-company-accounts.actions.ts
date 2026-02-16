import { GetCompanyAccountsModel } from '@common/interfaces';
import { AsyncRequest, FromApiActionPayload, WithRequestId, asyncProps } from '@lib/store';
import { createAction, props } from '@ngrx/store';

/** StateDetailsActions */
const ACTION_SET = '[GetCompanyAccounts] set';
const ACTION_UPDATE = '[GetCompanyAccounts] update';
const ACTION_RESET = '[GetCompanyAccounts] reset';
const ACTION_FAIL = '[GetCompanyAccounts] fail';
const ACTION_CANCEL_REQUEST = '[GetCompanyAccounts] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[GetCompanyAccounts] set from api';
const ACTION_UPDATE_FROM_API = '[GetCompanyAccounts] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setGetCompanyAccounts = createAction(ACTION_SET, props<WithRequestId<GetCompanyAccountsModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateGetCompanyAccounts = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<GetCompanyAccountsModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetGetCompanyAccounts = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelGetCompanyAccountsRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failGetCompanyAccounts = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setGetCompanyAccountsFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<GetCompanyAccountsModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateGetCompanyAccountsFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<GetCompanyAccountsModel>>()
);
