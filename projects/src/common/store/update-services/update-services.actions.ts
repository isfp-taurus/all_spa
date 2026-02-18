import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { UpdateServicesModel } from './update-services.state';

/** StateDetailsActions */
const ACTION_SET = '[UpdateServices] set';
const ACTION_UPDATE = '[UpdateServices] update';
const ACTION_RESET = '[UpdateServices] reset';
const ACTION_FAIL = '[UpdateServices] fail';
const ACTION_CANCEL_REQUEST = '[UpdateServices] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[UpdateServices] set from api';
const ACTION_UPDATE_FROM_API = '[UpdateServices] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setUpdateServices = createAction(ACTION_SET, props<WithRequestId<UpdateServicesModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateUpdateServices = createAction(ACTION_UPDATE, props<WithRequestId<Partial<UpdateServicesModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetUpdateServices = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelUpdateServicesRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failUpdateServices = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setUpdateServicesFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<UpdateServicesModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateUpdateServicesFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<UpdateServicesModel>>()
);
