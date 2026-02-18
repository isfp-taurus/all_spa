import { Type } from 'src/sdk-sysdate';
import { AsyncStoreItem } from '../common';

/**
 * Sysdate model
 */
export interface SysdateModel {
  model: Type | null;
}

/**
 * Sysdate store state
 */
export interface SysdateState extends AsyncStoreItem, SysdateModel {}

/**
 * Name of the Sysdate Store
 */
export const SYSDATE_STORE_NAME = 'sysdate';

/**
 * Sysdate Store Interface
 */
export interface SysdateStore {
  /** Sysdate state */
  [SYSDATE_STORE_NAME]: SysdateState;
}
