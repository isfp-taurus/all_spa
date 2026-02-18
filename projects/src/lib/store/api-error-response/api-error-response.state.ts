import { ApiErrorResponseModel } from '../../interfaces';

/**
 * ApiErrorResponse store state
 */
export interface ApiErrorResponseState {
  model: ApiErrorResponseModel | null;
}

/**
 * Name of the ApiErrorResponse Store
 */
export const API_ERROR_RESPONSE_STORE_NAME = 'apiErrorResponse';

/**
 * ApiErrorResponse Store Interface
 */
export interface ApiErrorResponseStore {
  /** ApiErrorResponse state */
  [API_ERROR_RESPONSE_STORE_NAME]: ApiErrorResponseState;
}
