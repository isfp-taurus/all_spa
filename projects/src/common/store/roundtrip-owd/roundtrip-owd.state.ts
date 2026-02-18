import { AsyncStoreItem } from '@lib/store';
import { RoundtripOwdResponse } from 'src/sdk-search';

/**
 * RoundtripOwd model
 */
export interface RoundtripOwdModel extends RoundtripOwdResponse {}

/**
 * RoundtripOwdResponse model details
 */
export interface RoundtripOwdStateDetails extends AsyncStoreItem, RoundtripOwdModel {}

/**
 * RoundtripOwd store state
 */
export interface RoundtripOwdState extends RoundtripOwdStateDetails, RoundtripOwdModel {}

/**
 * Name of the RoundtripOwd Store
 */
export const ROUNDTRIP_OWD_STORE_NAME = 'roundtripOwd';

/**
 * RoundtripOwd Store Interface
 */
export interface RoundtripOwdStore {
  /** RoundtripOwd state */
  [ROUNDTRIP_OWD_STORE_NAME]: RoundtripOwdState;
}
