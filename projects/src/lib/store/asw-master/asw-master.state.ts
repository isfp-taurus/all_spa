import { AswMasterModel } from '../../interfaces';

/**
 * AswMaster store state
 */
export interface AswMasterState extends AswMasterModel {}

/**
 * Name of the AswMaster Store
 */
export const ASW_MASTER_STORE_NAME = 'aswMaster';

/**
 * AswMaster Store Interface
 */
export interface AswMasterStore {
  /** AswMaster state */
  [ASW_MASTER_STORE_NAME]: AswMasterState;
}
