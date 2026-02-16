import { createAction, props } from '@ngrx/store';
import { WithRequestId } from '@lib/store';
import { ComplexFlightAvailabilityModel } from './complex-flight-availability.state';

/** StateDetailsActions */
const ACTION_SET = '[ComplexFlightAvailability] set';
const ACTION_UPDATE = '[ComplexFlightAvailability] update';
const ACTION_RESET = '[ComplexFlightAvailability] reset';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setComplexFlightAvailability = createAction(
  ACTION_SET,
  props<WithRequestId<ComplexFlightAvailabilityModel>>()
);

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateComplexFlightAvailability = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<ComplexFlightAvailabilityModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetComplexFlightAvailability = createAction(ACTION_RESET);
