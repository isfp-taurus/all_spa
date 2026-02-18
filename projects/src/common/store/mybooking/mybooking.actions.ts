import { createAction, props } from '@ngrx/store';
import { WithRequestId } from '@lib/store';
import { MyBookingModel } from './mybooking.state';

/** StateDetailsActions */
const ACTION_SET = '[MyBooking] set';
const ACTION_UPDATE = '[MyBooking] update';
const ACTION_RESET = '[MyBooking] reset';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setMyBooking = createAction(ACTION_SET, props<WithRequestId<MyBookingModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateMyBooking = createAction(ACTION_UPDATE, props<WithRequestId<Partial<MyBookingModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetMyBooking = createAction(ACTION_RESET);
