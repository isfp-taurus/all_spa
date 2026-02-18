import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PetInputEffect } from './pet-input.effect';
import { petInputReducer } from './pet-input.reducer';
import { PET_INPUT_STORE_NAME, PetInputState } from './pet-input.state';

/** Token of the PetInput reducer */
export const PET_INPUT_REDUCER_TOKEN = new InjectionToken<ActionReducer<PetInputState, Action>>(
  'Feature PetInput Reducer'
);

/** Provide default reducer for PetInput store */
export function getDefaultPetInputReducer() {
  return petInputReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(PET_INPUT_STORE_NAME, PET_INPUT_REDUCER_TOKEN),
    EffectsModule.forFeature([PetInputEffect]),
  ],
  providers: [{ provide: PET_INPUT_REDUCER_TOKEN, useFactory: getDefaultPetInputReducer }],
})
export class PetInputStoreModule {
  public static forRoot<T extends PetInputState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<PetInputStoreModule> {
    return {
      ngModule: PetInputStoreModule,
      providers: [{ provide: PET_INPUT_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
