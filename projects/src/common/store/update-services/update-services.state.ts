import { AsyncStoreItem } from '@lib/store';
import { UpdateServicesResponse } from 'src/sdk-servicing';

/**
 * UpdateServices model
 */
export interface UpdateServicesModel extends UpdateServicesResponse {}

/**
 * UpdateServices store state
 */
export interface UpdateServicesState extends AsyncStoreItem, UpdateServicesModel {}

/**
 * Name of the UpdateServices Store
 */
export const UPDATE_SERVICES_STORE_NAME = 'UpdateServices';

/**
 * UpdateServices Store Interface
 */
export interface UpdateServicesStore {
  /** UpdateServices state */
  [UPDATE_SERVICES_STORE_NAME]: UpdateServicesState;
}
