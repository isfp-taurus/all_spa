import { createAction, props } from '@ngrx/store';
import { asyncProps, FromApiActionPayload, WithRequestId, AsyncRequest } from '@lib/store';
import { UpdateAirOffersModel } from './update-air-offers.state';

/** StateDetailsActions */
const ACTION_SET = '[UpdateAirOffers] set';
const ACTION_UPDATE = '[UpdateAirOffers] update';
const ACTION_RESET = '[UpdateAirOffers] reset';
const ACTION_FAIL = '[UpdateAirOffers] fail';
const ACTION_CANCEL_REQUEST = '[UpdateAirOffers] cancel request';

/** Async Actions */
const ACTION_SET_FROM_API = '[UpdateAirOffers] set from api';
const ACTION_UPDATE_FROM_API = '[UpdateAirOffers] update from api';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setUpdateAirOffers = createAction(ACTION_SET, props<WithRequestId<UpdateAirOffersModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateUpdateAirOffers = createAction(ACTION_UPDATE, props<WithRequestId<Partial<UpdateAirOffersModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetUpdateAirOffers = createAction(ACTION_RESET);

/** Action to cancel a Request ID registered in the store. Can happen from effect based on a switchMap for instance */
export const cancelUpdateAirOffersRequest = createAction(ACTION_CANCEL_REQUEST, props<AsyncRequest>());

/**
 * Update isPending from the StateDetails to false, and isFailure to true
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const failUpdateAirOffers = createAction(ACTION_FAIL, props<WithRequestId<{ error: any }>>());

/**
 * Update isPending to true, triggers setFromApi Effect
 */
export const setUpdateAirOffersFromApi = createAction(
  ACTION_SET_FROM_API,
  asyncProps<FromApiActionPayload<UpdateAirOffersModel>>()
);

/**
 * Update isPending to true, triggers updateFromApi Effect
 */
export const updateUpdateAirOffersFromApi = createAction(
  ACTION_UPDATE_FROM_API,
  asyncProps<FromApiActionPayload<UpdateAirOffersModel>>()
);
