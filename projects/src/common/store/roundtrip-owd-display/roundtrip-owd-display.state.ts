import { AsyncStoreItem } from '@lib/store';
import { RoundtripOwdResponse } from 'src/sdk-search';

/**
 * RoundtripOwdDisplay model
 */
export interface RoundtripOwdDisplayModel extends RoundtripOwdResponse {}

/**
 * RoundtripOwdDisplayResponse model details
 */
export interface RoundtripOwdDisplayStateDetails extends AsyncStoreItem, RoundtripOwdDisplayModel {}

/**
 * RoundtripOwdDisplay store state
 */
export interface RoundtripOwdDisplayState extends RoundtripOwdDisplayStateDetails, RoundtripOwdDisplayModel {}

/**
 * Name of the RoundtripOwdDisplay Store
 */
export const ROUNDTRIP_OWD_DISPLAY_STORE_NAME = 'roundtripOwdDisplay';

/**
 * RoundtripOwdDisplay Store Interface
 */
export interface RoundtripOwdDisplayStore {
  /** RoundtripOwdDisplay state */
  [ROUNDTRIP_OWD_DISPLAY_STORE_NAME]: RoundtripOwdDisplayState;
}
