import { createAction, props } from '@ngrx/store';
import { WithRequestId } from '@lib/store';
import { DeliverySearchInformationModel } from './delivery-search-information.state';

/** StateDetailsActions */
const ACTION_UPDATE = '[DeliverySearchInformation] update';
const ACTION_RESET = '[DeliverySearchInformation] reset';

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateDeliverySearchInformation = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<DeliverySearchInformationModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetDeliverySearchInformation = createAction(ACTION_RESET);
