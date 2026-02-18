import { AsyncStoreItem } from '@lib/store';
import { PlansGetEstimationResponse } from 'src/sdk-reservation';

/**
 * GetEstimation model
 */
export interface GetEstimationModel extends PlansGetEstimationResponse {}

/**
 * PlansGetEstimationResponse model details
 */
export interface GetEstimationStateDetails extends AsyncStoreItem {}

/**
 * GetEstimation store state
 */
export interface GetEstimationState extends GetEstimationStateDetails, GetEstimationModel {}

/**
 * Name of the GetEstimation Store
 */
export const GET_ESTIMATION_STORE_NAME = 'getEstimation';

/**
 * GetEstimation Store Interface
 */
export interface GetEstimationStore {
  /** GetEstimation state */
  [GET_ESTIMATION_STORE_NAME]: GetEstimationState;
}
