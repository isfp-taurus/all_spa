import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CartsUpdatePetRakunoriEffect } from './carts-update-pet-rakunori.effect';
import { updatePetRakunoriReducer } from './carts-update-pet-rakunori.reducer';
import { UPDATE_PET_RAKUNORI_STORE_NAME, CartsUpdatePetRakunoriState } from './carts-update-pet-rakunori.state';

/** Token of the CartsUpdatePetRakunori reducer */
export const UPDATE_PET_RAKUNORI_REDUCER_TOKEN = new InjectionToken<ActionReducer<CartsUpdatePetRakunoriState, Action>>(
  'Feature CartsUpdatePetRakunori Reducer'
);

/** Provide default reducer for CartsUpdatePetRakunori store */
export function getDefaultCartsUpdatePetRakunoriReducer() {
  return updatePetRakunoriReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(UPDATE_PET_RAKUNORI_STORE_NAME, UPDATE_PET_RAKUNORI_REDUCER_TOKEN),
    EffectsModule.forFeature([CartsUpdatePetRakunoriEffect]),
  ],
  providers: [{ provide: UPDATE_PET_RAKUNORI_REDUCER_TOKEN, useFactory: getDefaultCartsUpdatePetRakunoriReducer }],
})
export class CartsUpdatePetRakunoriStoreModule {
  public static forRoot<T extends CartsUpdatePetRakunoriState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<CartsUpdatePetRakunoriStoreModule> {
    return {
      ngModule: CartsUpdatePetRakunoriStoreModule,
      providers: [{ provide: UPDATE_PET_RAKUNORI_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
