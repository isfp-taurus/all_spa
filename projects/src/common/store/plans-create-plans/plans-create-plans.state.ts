import { AsyncStoreItem } from '@lib/store';
import { PlansCreatePlansResponse } from 'src/sdk-reservation';

/**
 * PlansCreatePlans model
 */
export interface PlansCreatePlansModel extends PlansCreatePlansResponse {}

/**
 * PlansCreatePlansResponse model details
 */
export interface PlansCreatePlansStateDetails extends AsyncStoreItem, PlansCreatePlansModel {}

/**
 * PlansCreatePlans store state
 */
export interface PlansCreatePlansState extends PlansCreatePlansStateDetails {}

/**
 * Name of the PlansCreatePlans Store
 */
export const PLANS_CREATE_PLANS_STORE_NAME = 'plansCreatePlans';

/**
 * PlansCreatePlans Store Interface
 */
export interface PlansCreatePlansStore {
  /** PlansCreatePlans state */
  [PLANS_CREATE_PLANS_STORE_NAME]: PlansCreatePlansState;
}
