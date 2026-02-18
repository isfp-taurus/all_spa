import { AsyncStoreItem } from '../common';
import { GetEncryptedLoginInfoResponse } from 'src/sdk-user';

/**
 * GetEncryptedLoginInfo model
 */
export interface GetEncryptedLoginInfoModel {
  model: GetEncryptedLoginInfoResponse | null;
}

/**
 * GetEncryptedLoginInfoResponse model details
 */
export interface GetEncryptedLoginInfoStateDetails extends AsyncStoreItem {}

/**
 * GetEncryptedLoginInfo store state
 */
export interface GetEncryptedLoginInfoState extends GetEncryptedLoginInfoStateDetails, GetEncryptedLoginInfoModel {}

/**
 * Name of the GetEncryptedLoginInfo Store
 */
export const GET_ENCRYPTED_LOGIN_INFO_STORE_NAME = 'getEncryptedLoginInfo';

/**
 * GetEncryptedLoginInfo Store Interface
 */
export interface GetEncryptedLoginInfoStore {
  /** GetEncryptedLoginInfo state */
  [GET_ENCRYPTED_LOGIN_INFO_STORE_NAME]: GetEncryptedLoginInfoState;
}
