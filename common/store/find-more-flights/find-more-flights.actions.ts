import { createAction, props } from '@ngrx/store';
import { WithRequestId } from '@lib/store';
import { FindMoreFlightsModel } from './find-more-flights.state';

/** StateDetailsActions */
const ACTION_SET = '[FindMoreFlights] set';
const ACTION_UPDATE = '[FindMoreFlights] update';
const ACTION_RESET = '[FindMoreFlights] reset';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setFindMoreFlights = createAction(ACTION_SET, props<WithRequestId<FindMoreFlightsModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateFindMoreFlights = createAction(ACTION_UPDATE, props<WithRequestId<Partial<FindMoreFlightsModel>>>());

/**
 * Clear the whole state, return to the initial one
 */
export const resetFindMoreFlights = createAction(ACTION_RESET);
