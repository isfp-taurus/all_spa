import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UPDATE_AIR_OFFERS_STORE_NAME, UpdateAirOffersState } from './update-air-offers.state';

/** Select UpdateAirOffers State */
export const selectUpdateAirOffersState = createFeatureSelector<UpdateAirOffersState>(UPDATE_AIR_OFFERS_STORE_NAME);

/** Select UpdateAirOffers isPending status */
export const selectUpdateAirOffersIsPendingStatus = createSelector(
  selectUpdateAirOffersState,
  (state) => !!state.isPending
);

/** Select UpdateAirOffers isFailure status */
export const selectUpdateAirOffersIsFailureStatus = createSelector(
  selectUpdateAirOffersState,
  (state) => !!state.isFailure
);
