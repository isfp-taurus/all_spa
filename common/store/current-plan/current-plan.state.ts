import { AsyncStoreItem } from '@lib/store';
import { PlansGetPlansResponsePlansInner } from 'src/sdk-reservation';

/**
 * CurrentPlan model
 */
export interface CurrentPlanModel extends PlansGetPlansResponsePlansInner {}

/**
 * PlansGetPlansResponsePlansInner model details
 */
export interface CurrentPlanStateDetails extends AsyncStoreItem {}

/**
 * CurrentPlan store state
 */
export interface CurrentPlanState extends CurrentPlanStateDetails, CurrentPlanModel {}

/**
 * Name of the CurrentPlan Store
 */
export const CURRENT_PLAN_STORE_NAME = 'currentPlan';

/**
 * CurrentPlan Store Interface
 */
export interface CurrentPlanStore {
  /** CurrentPlan state */
  [CURRENT_PLAN_STORE_NAME]: CurrentPlanState;
}
