import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { FareConditionsModel } from './fare-conditions.state';

/** StateDetailsActions */
const ACTION_SET = '[FareConditions] set';
const ACTION_UPDATE = '[FareConditions] update';
const ACTION_RESET = '[FareConditions] reset';
const ACTION_FAIL = '[FareConditions] fail';
const ACTION_CANCEL_REQUEST = '[FareConditions] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[FareConditions] set from api';
const ACTION_UPDATE_FROM_API = '[FareConditions] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setFareConditions = createAction(ACTION_SET, props<WithRequestId<FareConditionsModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateFareConditions = createAction(ACTION_UPDATE, props<WithRequestId<Partial<FareConditionsModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetFareConditions = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelFareConditionsRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failFareConditions = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setFareConditionsFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<FareConditionsModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateFareConditionsFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<FareConditionsModel>>()
);
