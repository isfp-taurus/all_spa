import { ActionCreator, createReducer, on, ReducerTypes } from '@ngrx/store';
import { asyncStoreItemAdapter } from '@lib/store';
import * as actions from './delivery-information.actions';
import { DeliveryInformationState } from './delivery-information.state';

/**
 * deliveryInformation initial state
 */
export const deliveryInformationInitialState: DeliveryInformationState = {};

/**
 * List of basic actions for DeliveryInformation Store
 */
export const deliveryInformationReducerFeatures: ReducerTypes<DeliveryInformationState, ActionCreator[]>[] = [
  on(actions.setDeliveryInformation, (state, payload) => ({ ...payload })),

  on(actions.updateDeliveryInformation, (state, payload) => ({ ...state, ...payload })),

  on(actions.resetDeliveryInformation, () => deliveryInformationInitialState),
];

/**
 * DeliveryInformation Store reducer
 */
export const deliveryInformationReducer = createReducer(
  deliveryInformationInitialState,
  ...deliveryInformationReducerFeatures
);
