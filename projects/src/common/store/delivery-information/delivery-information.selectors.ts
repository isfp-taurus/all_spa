import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DELIVERY_INFORMATION_STORE_NAME, DeliveryInformationState } from './delivery-information.state';

/** Select DeliveryInformation State */
export const selectDeliveryInformationState = createFeatureSelector<DeliveryInformationState>(
  DELIVERY_INFORMATION_STORE_NAME
);
