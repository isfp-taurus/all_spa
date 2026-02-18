import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CartsUpdateServicesEffect } from './carts-update-services.effect';
import { cartsUpdateServicesReducer } from './carts-update-services.reducer';
import { CARTS_UPDATE_SERVICES_STORE_NAME, CartsUpdateServicesState } from './carts-update-services.state';

/** Token of the CartsUpdateServices reducer */
export const CARTS_UPDATE_SERVICES_REDUCER_TOKEN = new InjectionToken<ActionReducer<CartsUpdateServicesState, Action>>(
  'Feature CartsUpdateServices Reducer'
);

/** Provide default reducer for CartsUpdateServices store */
export function getDefaultCartsUpdateServicesReducer() {
  return cartsUpdateServicesReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(CARTS_UPDATE_SERVICES_STORE_NAME, CARTS_UPDATE_SERVICES_REDUCER_TOKEN),
    EffectsModule.forFeature([CartsUpdateServicesEffect]),
  ],
  providers: [{ provide: CARTS_UPDATE_SERVICES_REDUCER_TOKEN, useFactory: getDefaultCartsUpdateServicesReducer }],
})
export class CartsUpdateServicesStoreModule {
  public static forRoot<T extends CartsUpdateServicesState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<CartsUpdateServicesStoreModule> {
    return {
      ngModule: CartsUpdateServicesStoreModule,
      providers: [{ provide: CARTS_UPDATE_SERVICES_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
