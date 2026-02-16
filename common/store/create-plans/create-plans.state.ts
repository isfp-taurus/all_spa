import { AsyncStoreItem } from '@lib/store';
import { PlansCreatePlansResponse } from 'src/sdk-reservation';

/**
 * CreatePlans model
 */
export interface CreatePlansModel extends PlansCreatePlansResponse {}

/**
 * CreateCartResponse model details
 */
export interface CreatePlansStateDetails extends AsyncStoreItem {}

/**
 * CreatePlans store state
 */
export interface CreatePlansState extends CreatePlansStateDetails, CreatePlansModel {}

/**
 * Name of the CreatePlans Store
 */
export const CREATE_PLANS_STORE_NAME = 'createPlans';

/**
 * CreatePlans Store Interface
 */
export interface CreatePlansStore {
  /** CreatePlans state */
  [CREATE_PLANS_STORE_NAME]: CreatePlansState;
}
