import { createAction, props } from '@ngrx/store';
import { WithRequestId } from '@lib/store';
import { RoundtripFlightAvailabilityInternationalModel } from './roundtripFlightAvailabilityInternational.state';

/** StateDetailsActions */
const ACTION_SET = '[RoundtripFlightAvailabilityInternational] set';
const ACTION_UPDATE = '[RoundtripFlightAvailabilityInternational] update';
const ACTION_RESET = '[RoundtripFlightAvailabilityInternational] reset';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setRoundtripFlightAvailabilityInternational = createAction(
  ACTION_SET,
  props<WithRequestId<RoundtripFlightAvailabilityInternationalModel>>()
);

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateRoundtripFlightAvailabilityInternational = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<RoundtripFlightAvailabilityInternationalModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetRoundtripFlightAvailabilityInternational = createAction(ACTION_RESET);
