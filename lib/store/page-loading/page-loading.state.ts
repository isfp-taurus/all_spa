import { PageLoadingModel } from '../../interfaces';

/**
 * PageLoading store state
 */
export interface PageLoadingState extends PageLoadingModel {}

/**
 * Name of the PageLoading Store
 */
export const PAGE_INIT_STORE_NAME = 'pageLoading';

/**
 * PageLoading Store Interface
 */
export interface PageLoadingStore {
  /** PageLoading state */
  [PAGE_INIT_STORE_NAME]: PageLoadingState;
}
