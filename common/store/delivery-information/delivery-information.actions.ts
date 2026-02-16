import { createAction, props } from '@ngrx/store';
import { WithRequestId } from '@lib/store';
import { DeliveryInformationModel } from '@common/interfaces';

/** StateDetailsActions */
const ACTION_SET = '[DeliveryInformation] set';
const ACTION_UPDATE = '[DeliveryInformation] update';
const ACTION_RESET = '[DeliveryInformation] reset';

/**
 * Clear the current store object and replace it with the new one,
 * update isFailure to false, and update isPending with the boolean given as parameter if defined
 */
export const setDeliveryInformation = createAction(ACTION_SET, props<WithRequestId<DeliveryInformationModel>>());

/**
 * Change a part or the whole object in the store and update isFailure to false. The pendingUpdate boolean,
 * if set to true or false, will update the isPending property from the StateDetails
 */
export const updateDeliveryInformation = createAction(
  ACTION_UPDATE,
  props<WithRequestId<Partial<DeliveryInformationModel>>>()
);

/**
 * Clear the whole state, return to the initial one
 */
export const resetDeliveryInformation = createAction(ACTION_RESET);
