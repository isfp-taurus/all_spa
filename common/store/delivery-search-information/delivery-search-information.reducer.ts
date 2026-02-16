import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './delivery-search-information.actions';
import { DeliverySearchInformationState } from './delivery-search-information.state';

/**
 * deliverySearchInformation initial state
 */
export const deliverySearchInformationInitialState: DeliverySearchInformationState = {
  errorInfo: {
    errorMsgId: undefined,
    params: undefined,
    apiErrorCode: undefined,
  },
};

/**
 * List of basic actions for DeliverySearchInformation Store
 */
export const deliverySearchInformationReducerFeatures: ReducerTypes<DeliverySearchInformationState, ActionCreator[]>[] =
  [
    on(actions.updateDeliverySearchInformation, (state, payload) => ({ ...state, ...payload })),

    on(actions.resetDeliverySearchInformation, () => deliverySearchInformationInitialState),
  ];

/**
 * DeliverySearchInformation Store reducer
 */
export const deliverySearchInformationReducer = createReducer(
  deliverySearchInformationInitialState,
  ...deliverySearchInformationReducerFeatures
);
