import { NotRetryableErrorModel } from '../../interfaces';

/**
 * NotRetryableError store state
 */
export interface NotRetryableErrorState {
  model: NotRetryableErrorModel | null;
}

/**
 * Name of the NotRetryableError Store
 */
export const NOT_RETRYABLE_ERROR_STORE_NAME = 'notRetryableError';

/**
 * NotRetryableError Store Interface
 */
export interface NotRetryableErrorStore {
  /** NotRetryableError state */
  [NOT_RETRYABLE_ERROR_STORE_NAME]: NotRetryableErrorState;
}
