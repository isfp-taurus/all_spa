import { AsyncStoreItem } from '../common';
import { GetMemberInformationResponse } from 'src/sdk-member';

/**
 * GetMemberInformation model
 */
export interface GetMemberInformationModel {
  model: GetMemberInformationResponse | null;
}

/**
 * GetMemberInformationResponse model details
 */
export interface GetMemberInformationStateDetails extends AsyncStoreItem {}

/**
 * GetMemberInformation store state
 */
export interface GetMemberInformationState extends GetMemberInformationStateDetails, GetMemberInformationModel {}

/**
 * Name of the GetMemberInformation Store
 */
export const GET_MEMBER_INFORMATION_STORE_NAME = 'getMemberInformation';

/**
 * GetMemberInformation Store Interface
 */
export interface GetMemberInformationStore {
  /** GetMemberInformation state */
  [GET_MEMBER_INFORMATION_STORE_NAME]: GetMemberInformationState;
}
