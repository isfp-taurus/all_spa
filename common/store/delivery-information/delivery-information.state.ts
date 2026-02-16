import { DeliveryInformationModel } from '@common/interfaces';

/**
 *  model details
 */
export interface DeliveryInformationStateDetails extends DeliveryInformationModel {}

/**
 * DeliveryInformation store state
 */
export interface DeliveryInformationState extends DeliveryInformationStateDetails {}

/**
 * Name of the DeliveryInformation Store
 */
export const DELIVERY_INFORMATION_STORE_NAME = 'deliveryInformation';

/**
 * DeliveryInformation Store Interface
 */
export interface DeliveryInformationStore {
  /** DeliveryInformation state */
  [DELIVERY_INFORMATION_STORE_NAME]: DeliveryInformationState;
}
