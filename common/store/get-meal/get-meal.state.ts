import { AsyncStoreItem } from '@lib/store';
import { GetMealResponse } from 'src/sdk-servicing';

/**
 * GetMeal model
 */
export interface GetMealModel extends GetMealResponse {}

/**
 *  model details
 */
export interface GetMealStateDetails extends AsyncStoreItem {}

/**
 * GetMeal store state
 */
export interface GetMealState extends GetMealStateDetails, GetMealModel {}

/**
 * Name of the GetMeal Store
 */
export const GET_MEAL_STORE_NAME = 'getMeal';

/**
 * GetMeal Store Interface
 */
export interface GetMealStore {
  /** GetMeal state */
  [GET_MEAL_STORE_NAME]: GetMealState;
}
