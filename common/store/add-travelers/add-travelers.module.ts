import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AddTravelersEffect } from './add-travelers.effect';
import { addTravelersReducer } from './add-travelers.reducer';
import { ADD_TRAVELERS_STORE_NAME, AddTravelersState } from './add-travelers.state';

/** Token of the AddTravelers reducer */
export const ADD_TRAVELERS_REDUCER_TOKEN = new InjectionToken<ActionReducer<AddTravelersState, Action>>(
  'Feature AddTravelers Reducer'
);

/** Provide default reducer for AddTravelers store */
export function getDefaultAddTravelersReducer() {
  return addTravelersReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(ADD_TRAVELERS_STORE_NAME, ADD_TRAVELERS_REDUCER_TOKEN),
    EffectsModule.forFeature([AddTravelersEffect]),
  ],
  providers: [{ provide: ADD_TRAVELERS_REDUCER_TOKEN, useFactory: getDefaultAddTravelersReducer }],
})
export class AddTravelersStoreModule {
  public static forRoot<T extends AddTravelersState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<AddTravelersStoreModule> {
    return {
      ngModule: AddTravelersStoreModule,
      providers: [{ provide: ADD_TRAVELERS_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
