import { DynamicContent } from '../../interfaces';

/**
 * DynamicContent store state
 */
export interface DynamicContentState {
  pageInfo: DynamicContent | null;
  subPageInfo: DynamicContent | null;
}

/**
 * Name of the DynamicContent Store
 */
export const DYNAMIC_CONTENT_STORE_NAME = 'dynamicContent';

/**
 * DynamicContent Store Interface
 */
export interface DynamicContentStore {
  /** DynamicContent state */
  [DYNAMIC_CONTENT_STORE_NAME]: DynamicContentState;
}
