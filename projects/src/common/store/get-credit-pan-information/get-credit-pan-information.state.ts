import { AsyncStoreItem } from '@lib/store';
import { GetCreditPanInformationResponse } from 'src/sdk-credit';

/**
 * GetCreditPanInformation model
 */
export interface GetCreditPanInformationModel {
  model: GetCreditPanInformationResponse | null;
}

/**
 * GetCreditPanInformationResponse model details
 */
export interface GetCreditPanInformationStateDetails extends AsyncStoreItem {}

/**
 * GetCreditPanInformation store state
 */
export interface GetCreditPanInformationState
  extends GetCreditPanInformationStateDetails,
    GetCreditPanInformationModel {}

/**
 * Name of the GetCreditPanInformation Store
 */
export const GET_CREDIT_PAN_INFORMATION_STORE_NAME = 'getCreditPanInformation';

/**
 * GetCreditPanInformation Store Interface
 */
export interface GetCreditPanInformationStore {
  /** GetCreditPanInformation state */
  [GET_CREDIT_PAN_INFORMATION_STORE_NAME]: GetCreditPanInformationState;
}
