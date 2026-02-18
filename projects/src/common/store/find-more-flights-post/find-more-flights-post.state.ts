import { AsyncStoreItem } from '@lib/store';
import { FindMoreFlightsResponse } from 'src/sdk-search';

/**
 * FindMoreFlightsPost model
 */
export interface FindMoreFlightsPostModel extends FindMoreFlightsResponse {}

/**
 * PostFindMoreFlightsPostResponse model details
 */
export interface FindMoreFlightsPostStateDetails extends AsyncStoreItem, FindMoreFlightsPostModel {}

/**
 * FindMoreFlightsPost store state
 */
export interface FindMoreFlightsPostState extends FindMoreFlightsPostStateDetails {}

/**
 * Name of the FindMoreFlightsPost Store
 */
export const FIND_MORE_FLIGHTS_POST_NAME = 'FindMoreFlightsPost';

/**
 * FindMoreFlightsPost Store Interface
 */
export interface FindMoreFlightsPostStore {
  /** FindMoreFlightsPost state */
  [FIND_MORE_FLIGHTS_POST_NAME]: FindMoreFlightsPostState;
}
