import { AsyncStoreItem } from '@lib/store';
import { RoundtripFppResponse } from '../../sdk';

/**
 * RoundtripFpp model
 */
export interface RoundtripFppModel {
  model: RoundtripFppResponse | null;
}

/**
 *  model details
 */
export interface RoundtripFppStateDetails extends AsyncStoreItem {}

/**
 * RoundtripFpp store state
 */
export interface RoundtripFppState extends RoundtripFppStateDetails, RoundtripFppModel {}

/**
 * Name of the RoundtripFpp Store
 */
export const ROUNDTRIP_FPP_STORE_NAME = 'roundtripFpp';

/**
 * RoundtripFpp Store Interface
 */
export interface RoundtripFppStore {
  /** RoundtripFpp state */
  [ROUNDTRIP_FPP_STORE_NAME]: RoundtripFppState;
}
