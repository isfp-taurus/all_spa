import { AsyncStoreItem } from '../common';
import { GetBasicReservationInformationResponse } from 'src/sdk-amcmember';

/**
 * GetBasicReservationInformation model
 */
export interface GetBasicReservationInformationModel extends GetBasicReservationInformationResponse {}

/**
 * GetBasicReservationInformationResponse model details
 */
export interface GetBasicReservationInformationStateDetails extends AsyncStoreItem {}

/**
 * GetBasicReservationInformation store state
 */
export interface GetBasicReservationInformationState
  extends GetBasicReservationInformationStateDetails,
    GetBasicReservationInformationModel {}

/**
 * Name of the GetBasicReservationInformation Store
 */
export const GET_BASIC_RESERVATION_INFORMATION_STORE_NAME = 'getBasicReservationInformation';

/**
 * GetBasicReservationInformation Store Interface
 */
export interface GetBasicReservationInformationStore {
  /** GetBasicReservationInformation state */
  [GET_BASIC_RESERVATION_INFORMATION_STORE_NAME]: GetBasicReservationInformationState;
}
