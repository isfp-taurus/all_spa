import { AsyncStoreItem } from '@lib/store';
import { PatchUpdateAirOffersResponse } from 'src/sdk-reservation';

/**
 * UpdateAirOffers model
 */
export interface UpdateAirOffersModel extends PatchUpdateAirOffersResponse {}

/**
 * PatchUpdateAirOffersResponse model details
 */
export interface UpdateAirOffersStateDetails extends AsyncStoreItem {}

/**
 * UpdateAirOffers store state
 */
export interface UpdateAirOffersState extends UpdateAirOffersStateDetails, UpdateAirOffersModel {}

/**
 * Name of the UpdateAirOffers Store
 */
export const UPDATE_AIR_OFFERS_STORE_NAME = 'updateAirOffers';

/**
 * UpdateAirOffers Store Interface
 */
export interface UpdateAirOffersStore {
  /** UpdateAirOffers state */
  [UPDATE_AIR_OFFERS_STORE_NAME]: UpdateAirOffersState;
}
