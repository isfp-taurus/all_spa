import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { RefreshAmcmemberBalanceModel } from './refresh-amcmember-balance.state';

/** StateDetailsActions */
const ACTION_SET = '[RefreshAmcmemberBalance] set';
const ACTION_UPDATE = '[RefreshAmcmemberBalance] update';
const ACTION_RESET = '[RefreshAmcmemberBalance] reset';
const ACTION_FAIL = '[RefreshAmcmemberBalance] fail';
const ACTION_CANCEL_REQUEST = '[RefreshAmcmemberBalance] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[RefreshAmcmemberBalance] set from api';
const ACTION_UPDATE_FROM_API = '[RefreshAmcmemberBalance] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setRefreshAmcmemberBalance = createAction(
  ACTION_SET,
  props<WithRequestId<RefreshAmcmemberBalanceModel>>()
);

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateRefreshAmcmemberBalance = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<RefreshAmcmemberBalanceModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetRefreshAmcmemberBalance = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelRefreshAmcmemberBalanceRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failRefreshAmcmemberBalance = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setRefreshAmcmemberBalanceFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<RefreshAmcmemberBalanceModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateRefreshAmcmemberBalanceFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<RefreshAmcmemberBalanceModel>>()
);
