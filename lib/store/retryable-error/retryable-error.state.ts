import { RetryableError } from '../../interfaces';

/**
 * RetryableError store state
 */
export interface RetryableErrorState {
  pageInfo: RetryableError | null;
  subPageInfo: RetryableError | null;
}

/**
 * Name of the RetryableError Store
 */
export const RETRYABLE_ERROR_STORE_NAME = 'retryableError';

/**
 * RetryableError Store Interface
 */
export interface RetryableErrorStore {
  /** RetryableError state */
  [RETRYABLE_ERROR_STORE_NAME]: RetryableErrorState;
}
