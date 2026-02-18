import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { UpdateAirOffersEffect } from './update-air-offers.effect';
import { updateAirOffersReducer } from './update-air-offers.reducer';
import { UPDATE_AIR_OFFERS_STORE_NAME, UpdateAirOffersState } from './update-air-offers.state';

/** Token of the UpdateAirOffers reducer */
export const UPDATE_AIR_OFFERS_REDUCER_TOKEN = new InjectionToken<ActionReducer<UpdateAirOffersState, Action>>(
  'Feature UpdateAirOffers Reducer'
);

/** Provide default reducer for UpdateAirOffers store */
export function getDefaultUpdateAirOffersReducer() {
  return updateAirOffersReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(UPDATE_AIR_OFFERS_STORE_NAME, UPDATE_AIR_OFFERS_REDUCER_TOKEN),
    EffectsModule.forFeature([UpdateAirOffersEffect]),
  ],
  providers: [{ provide: UPDATE_AIR_OFFERS_REDUCER_TOKEN, useFactory: getDefaultUpdateAirOffersReducer }],
})
export class UpdateAirOffersStoreModule {
  public static forRoot<T extends UpdateAirOffersState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<UpdateAirOffersStoreModule> {
    return {
      ngModule: UpdateAirOffersStoreModule,
      providers: [{ provide: UPDATE_AIR_OFFERS_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
