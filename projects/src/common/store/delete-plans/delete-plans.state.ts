import { AsyncStoreItem } from '@lib/store';
import { PlansDeletePlansResponse } from 'src/sdk-reservation';

/**
 * DeletePlans model
 */
export interface DeletePlansModel extends PlansDeletePlansResponse {}

/**
 * PlansDeletePlansRequest model details
 */
export interface DeletePlansStateDetails extends AsyncStoreItem {}

/**
 * DeletePlans store state
 */
export interface DeletePlansState extends DeletePlansStateDetails, DeletePlansModel {}

/**
 * Name of the DeletePlans Store
 */
export const DELETE_PLANS_STORE_NAME = 'deletePlans';

/**
 * DeletePlans Store Interface
 */
export interface DeletePlansStore {
  /** DeletePlans state */
  [DELETE_PLANS_STORE_NAME]: DeletePlansState;
}
