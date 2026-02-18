import { AsyncStoreItem } from '@lib/store';
import { FavoritePostResponse } from 'src/sdk-search';

/**
 * FavoritePost model
 */
export interface FavoritePostModel {}

/**
 *  model details
 */
export interface FavoritePostStateDetails extends AsyncStoreItem {}

/**
 * FavoritePost store state
 */
export interface FavoritePostState extends FavoritePostStateDetails, FavoritePostModel, FavoritePostResponse {}

/**
 * Name of the FavoritePost Store
 */
export const FAVORITE_POST_STORE_NAME = 'favoritePost';

/**
 * FavoritePost Store Interface
 */
export interface FavoritePostStore {
  /** FavoritePost state */
  [FAVORITE_POST_STORE_NAME]: FavoritePostState;
}
