import { AsyncStoreItem } from '@lib/store';

/**
 * Favorite model
 */
export interface FavoriteModel {}

/**
 *  model details
 */
export interface FavoriteStateDetails extends AsyncStoreItem, FavoriteModel {}

/**
 * Favorite store state
 */
export interface FavoriteState extends FavoriteStateDetails, FavoriteModel {}

/**
 * Name of the Favorite Store
 */
export const FAVORITE_STORE_NAME = 'favorite';

/**
 * Favorite Store Interface
 */
export interface FavoriteStore {
  /** Favorite state */
  [FAVORITE_STORE_NAME]: FavoriteState;
}
