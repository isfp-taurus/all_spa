import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { UpdateTravelersEffect } from './update-travelers.effect';
import { updateTravelersReducer } from './update-travelers.reducer';
import { UPDATE_TRAVELERS_STORE_NAME, UpdateTravelersState } from './update-travelers.state';

/** Token of the UpdateTravelers reducer */
export const UPDATE_TRAVELERS_REDUCER_TOKEN = new InjectionToken<ActionReducer<UpdateTravelersState, Action>>(
  'Feature UpdateTravelers Reducer'
);

/** Provide default reducer for UpdateTravelers store */
export function getDefaultUpdateTravelersReducer() {
  return updateTravelersReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(UPDATE_TRAVELERS_STORE_NAME, UPDATE_TRAVELERS_REDUCER_TOKEN),
    EffectsModule.forFeature([UpdateTravelersEffect]),
  ],
  providers: [{ provide: UPDATE_TRAVELERS_REDUCER_TOKEN, useFactory: getDefaultUpdateTravelersReducer }],
})
export class UpdateTravelersStoreModule {
  public static forRoot<T extends UpdateTravelersState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<UpdateTravelersStoreModule> {
    return {
      ngModule: UpdateTravelersStoreModule,
      providers: [{ provide: UPDATE_TRAVELERS_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
