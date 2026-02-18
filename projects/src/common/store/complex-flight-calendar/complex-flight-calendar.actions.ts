import { createAction, props } from '@ngrx/store';
import { WithRequestId } from '@lib/store';
import { ComplexFlightCalendarModel } from './complex-flight-calendar.state';

/** StateDetailsActions */
const ACTION_SET = '[ComplexFlightCalendar] set';
const ACTION_UPDATE = '[ComplexFlightCalendar] update';
const ACTION_RESET = '[ComplexFlightCalendar] reset';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setComplexFlightCalendar = createAction(ACTION_SET, props<WithRequestId<ComplexFlightCalendarModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateComplexFlightCalendar = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<ComplexFlightCalendarModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetComplexFlightCalendar = createAction(ACTION_RESET);
