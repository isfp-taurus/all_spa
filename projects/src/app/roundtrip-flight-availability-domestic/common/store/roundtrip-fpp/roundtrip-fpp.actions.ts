import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { RoundtripFppModel } from './roundtrip-fpp.state';
import { RoundtripFppResponse } from '../../sdk';

/** StateDetailsActions */
const ACTION_SET = '[RoundtripFpp] set';
const ACTION_UPDATE = '[RoundtripFpp] update';
const ACTION_RESET = '[RoundtripFpp] reset';
const ACTION_FAIL = '[RoundtripFpp] fail';
const ACTION_CANCEL_REQUEST = '[RoundtripFpp] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[RoundtripFpp] set from api';
const ACTION_UPDATE_FROM_API = '[RoundtripFpp] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setRoundtripFpp = createAction(ACTION_SET, props<WithRequestId<RoundtripFppModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateRoundtripFpp = createAction(ACTION_UPDATE, props<WithRequestId<Partial<RoundtripFppModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetRoundtripFpp = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelRoundtripFppRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failRoundtripFpp = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setRoundtripFppFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<RoundtripFppResponse>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateRoundtripFppFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<RoundtripFppResponse>>()
);
