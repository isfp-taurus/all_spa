import { AnaBizContextModel } from '../../interfaces';
import { AsyncStoreItem } from '../common';

/**
 * model details
 */
export interface AnaBizContextStateDetails extends AsyncStoreItem {}

/**
 * AnaBizContext store state
 */
export interface AnaBizContextState extends AnaBizContextStateDetails, AnaBizContextModel {}

/**
 * Name of the AnaBizContext Store
 */
export const ANA_BIZ_CONTEXT_STORE_NAME = 'anaBizContext';

/**
 * AnaBizContext Store Interface
 */
export interface AnaBizContextStore {
  /** AnaBizContext state */
  [ANA_BIZ_CONTEXT_STORE_NAME]: AnaBizContextState;
}
