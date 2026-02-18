import { AswContextModel } from '../../interfaces';
import { AsyncStoreItem } from '../common';

/**
 *  model details
 */
export interface AswContextStateDetails extends AsyncStoreItem {}

/**
 * AswContext store state
 */
export interface AswContextState extends AswContextStateDetails, AswContextModel {}

/**
 * Name of the AswContext Store
 */
export const ASW_CONTEXT_STORE_NAME = 'aswContext';

/**
 * AswContext Store Interface
 */
export interface AswContextStore {
  /** AswContext state */
  [ASW_CONTEXT_STORE_NAME]: AswContextState;
}
