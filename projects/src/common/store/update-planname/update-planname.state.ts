import { AsyncStoreItem } from '@lib/store';
import { PlansUpdatePlannameResponse } from 'src/sdk-reservation';

/**
 * UpdatePlanname model
 */
export interface UpdatePlannameModel extends PlansUpdatePlannameResponse {}

/**
 * PlansUpdatePlannameResponse model details
 */
export interface UpdatePlannameStateDetails extends AsyncStoreItem {}

/**
 * UpdatePlanname store state
 */
export interface UpdatePlannameState extends UpdatePlannameStateDetails, UpdatePlannameModel {}

/**
 * Name of the UpdatePlanname Store
 */
export const UPDATE_PLANNAME_STORE_NAME = 'updatePlanname';

/**
 * UpdatePlanname Store Interface
 */
export interface UpdatePlannameStore {
  /** UpdatePlanname state */
  [UPDATE_PLANNAME_STORE_NAME]: UpdatePlannameState;
}
