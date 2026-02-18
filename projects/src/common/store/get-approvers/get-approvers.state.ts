import { AsyncStoreItem } from '@lib/store';
import { OrdersAnaBizGetApproversResponse } from 'src/sdk-reservation';

/**
 * GetApprovers model
 */
export interface GetApproversModel extends OrdersAnaBizGetApproversResponse {}

/**
 * GetApproversResponse model details
 */
export interface GetApproversStateDetails extends AsyncStoreItem {}

/**
 * GetApprovers store state
 */
export interface GetApproversState extends GetApproversStateDetails, GetApproversModel {}

/**
 * Name of the GetApprovers Store
 */
export const GET_APPROVERS_STORE_NAME = 'getApprovers';

/**
 * GetApprovers Store Interface
 */
export interface GetApproversStore {
  /** GetApprovers state */
  [GET_APPROVERS_STORE_NAME]: GetApproversState;
}
