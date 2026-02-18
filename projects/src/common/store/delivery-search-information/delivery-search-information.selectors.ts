import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  DELIVERY_SEARCH_INFORMATION_STORE_NAME,
  DeliverySearchInformationState,
} from './delivery-search-information.state';

/** Select DeliverySearchInformation State */
export const selectDeliverySearchInformationState = createFeatureSelector<DeliverySearchInformationState>(
  DELIVERY_SEARCH_INFORMATION_STORE_NAME
);
