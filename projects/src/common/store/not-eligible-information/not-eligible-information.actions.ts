import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { NotEligibleInformationModel as NotEligibleInformationModel } from './not-eligible-information.state';

/** StateDetailsActions */
const ACTION_SET = '[NotEligibleInformation] set';
const ACTION_UPDATE = '[NotEligibleInformation] update';
const ACTION_RESET = '[NotEligibleInformation] reset';
const ACTION_FAIL = '[NotEligibleInformation] fail';
const ACTION_CANCEL_REQUEST = 'NotEligibleInformation] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[NotEligibleInformation] set from api';
const ACTION_UPDATE_FROM_API = '[NotEligibleInformation] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setNotEligibleInformation = createAction(ACTION_SET, props<WithRequestId<NotEligibleInformationModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateNotEligibleInformation = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<NotEligibleInformationModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetNotEligibleInformation = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelCNotEligibleInformationRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failNotEligibleInformation = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setNotEligibleInformationFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<NotEligibleInformationModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateNotEligibleInformationFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<NotEligibleInformationModel>>()
);
