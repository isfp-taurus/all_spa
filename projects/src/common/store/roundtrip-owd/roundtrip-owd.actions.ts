import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { RoundtripOwdModel } from './roundtrip-owd.state';

/** StateDetailsActions */
const ACTION_SET = '[RoundtripOwd] set';
const ACTION_UPDATE = '[RoundtripOwd] update';
const ACTION_RESET = '[RoundtripOwd] reset';
const ACTION_FAIL = '[RoundtripOwd] fail';
const ACTION_CANCEL_REQUEST = '[RoundtripOwd] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[RoundtripOwd] set from api';
const ACTION_UPDATE_FROM_API = '[RoundtripOwd] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setRoundtripOwd = createAction(ACTION_SET, props<WithRequestId<RoundtripOwdModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateRoundtripOwd = createAction(ACTION_UPDATE, props<WithRequestId<Partial<RoundtripOwdModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetRoundtripOwd = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelRoundtripOwdRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failRoundtripOwd = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setRoundtripOwdFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<RoundtripOwdModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateRoundtripOwdFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<RoundtripOwdModel>>()
);
