import { GetMemberInformationResponse } from 'src/sdk-member';
import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '../common';
import { GetMemberInformationModel } from './get-member-information.state';

/** StateDetailsActions */
const ACTION_SET = '[GetMemberInformation] set';
const ACTION_UPDATE = '[GetMemberInformation] update';
const ACTION_RESET = '[GetMemberInformation] reset';
const ACTION_FAIL = '[GetMemberInformation] fail';
const ACTION_CANCEL_REQUEST = '[GetMemberInformation] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[GetMemberInformation] set from api';
const ACTION_UPDATE_FROM_API = '[GetMemberInformation] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setGetMemberInformation = createAction(ACTION_SET, props<WithRequestId<GetMemberInformationModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateGetMemberInformation = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<GetMemberInformationModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetGetMemberInformation = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelGetMemberInformationRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failGetMemberInformation = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setGetMemberInformationFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<GetMemberInformationResponse>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateGetMemberInformationFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<GetMemberInformationResponse>>()
);
