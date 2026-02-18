import { RetryableError } from '@lib/interfaces';

/**
 *  DeliverySearchInformationModel
 */
export interface DeliverySearchInformationModel {
  errorInfo: RetryableError;
}
/**
 *  model details
 */
export interface DeliverySearchInformationStateDetails extends DeliverySearchInformationModel {}

/**
 * DeliverySearchInformation store state
 */
export interface DeliverySearchInformationState extends DeliverySearchInformationStateDetails {}

/**
 * Name of the DeliverySearchInformation Store
 */
export const DELIVERY_SEARCH_INFORMATION_STORE_NAME = 'deliverySearchInformation';

/**
 * DeliverySearchInformation Store Interface
 */
export interface DeliverySearchInformationStore {
  /** DeliverySearchInformation state */
  [DELIVERY_SEARCH_INFORMATION_STORE_NAME]: DeliverySearchInformationState;
}
