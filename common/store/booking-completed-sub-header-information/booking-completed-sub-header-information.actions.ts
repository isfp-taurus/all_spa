import { createAction, props } from '@ngrx/store';
import { WithRequestId } from '@lib/store';
import { BookingCompletedSubHeaderInformationModel } from './booking-completed-sub-header-information.state';

/** StateDetailsActions */
const ACTION_SET = '[BookingCompletedSubHeaderInformation] set';
const ACTION_UPDATE = '[BookingCompletedSubHeaderInformation] update';
const ACTION_RESET = '[BookingCompletedSubHeaderInformation] reset';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setBookingCompletedSubHeaderInformation = createAction(
  ACTION_SET,
  props<WithRequestId<BookingCompletedSubHeaderInformationModel>>()
);

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateBookingCompletedSubHeaderInformation = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<BookingCompletedSubHeaderInformationModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetBookingCompletedSubHeaderInformation = createAction(ACTION_RESET);
