import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { RoundtripOwdDisplayModel } from './roundtrip-owd-display.state';

/** StateDetailsActions */
const ACTION_SET = '[RoundtripOwdDisplay] set';
const ACTION_UPDATE = '[RoundtripOwdDisplay] update';
const ACTION_RESET = '[RoundtripOwdDisplay] reset';
const ACTION_FAIL = '[RoundtripOwdDisplay] fail';
const ACTION_CANCEL_REQUEST = '[RoundtripOwdDisplay] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[RoundtripOwdDisplay] set from api';
const ACTION_UPDATE_FROM_API = '[RoundtripOwdDisplay] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setRoundtripOwdDisplay = createAction(ACTION_SET, props<WithRequestId<RoundtripOwdDisplayModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateRoundtripOwdDisplay = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<RoundtripOwdDisplayModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetRoundtripOwdDisplay = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelRoundtripOwdDisplayRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failRoundtripOwdDisplay = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setRoundtripOwdDisplayFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<RoundtripOwdDisplayModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateRoundtripOwdDisplayFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<RoundtripOwdDisplayModel>>()
);
