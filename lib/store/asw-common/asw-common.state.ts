import { AswCommonModel } from '../../interfaces';

/**
 * AswCommon store state
 */
export interface AswCommonState extends AswCommonModel {}

/**
 * Name of the AswCommon Store
 */
export const ASW_COMMON_STORE_NAME = 'aswCommon';

/**
 * AswCommon Store Interface
 */
export interface AswCommonStore {
  /** AswCommon state */
  [ASW_COMMON_STORE_NAME]: AswCommonState;
}
