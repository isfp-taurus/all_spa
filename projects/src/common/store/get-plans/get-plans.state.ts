import { AsyncStoreItem } from '@lib/store';
import { PlansGetPlansResponse, PlansGetPlansResponsePlansInner } from 'src/sdk-reservation';

/**
 * GetPlans model
 */
export interface GetPlansModel extends PlansGetPlansResponse {}

/**
 * PlansGetPlansResponse model details
 */
export interface GetPlansStateDetails extends AsyncStoreItem, GetPlansModel {}

/**
 * GetPlans store state
 */
export interface GetPlansState extends GetPlansStateDetails {}

/**
 * Name of the GetPlans Store
 */
export const GET_PLANS_STORE_NAME = 'getPlans';

/**
 * GetPlans Store Interface
 */
export interface GetPlansStore {
  /** GetPlans state */
  [GET_PLANS_STORE_NAME]: GetPlansState;
}
