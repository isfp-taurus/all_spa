import { AsyncStoreItem } from '../common';
import { GetAwardUsersResponse } from 'src/sdk-amcmember';

/**
 * GetAwardUsers model
 */
export interface GetAwardUsersModel extends GetAwardUsersResponse {}

/**
 * GetBasicReservationInformationResponse model details
 */
export interface GetAwardUsersStateDetails extends AsyncStoreItem {}

/**
 * GetAwardUsers store state
 */
export interface GetAwardUsersState extends GetAwardUsersStateDetails, GetAwardUsersModel {}

/**
 * Name of the GetAwardUsers Store
 */
export const GET_AWARD_USERS_STORE_NAME = 'getAwardUsers';

/**
 * GetAwardUsers Store Interface
 */
export interface GetAwardUsersStore {
  /** GetAwardUsers state */
  [GET_AWARD_USERS_STORE_NAME]: GetAwardUsersState;
}
