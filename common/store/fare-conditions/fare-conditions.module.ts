import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { FareConditionsEffect } from './fare-conditions.effect';
import { fareConditionsReducer } from './fare-conditions.reducer';
import { FARE_CONDITIONS_STORE_NAME, FareConditionsState } from './fare-conditions.state';

/** Token of the FareConditions reducer */
export const FARE_CONDITIONS_REDUCER_TOKEN = new InjectionToken<ActionReducer<FareConditionsState, Action>>(
  'Feature FareConditions Reducer'
);

/** Provide default reducer for FareConditions store */
export function getDefaultFareConditionsReducer() {
  return fareConditionsReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(FARE_CONDITIONS_STORE_NAME, FARE_CONDITIONS_REDUCER_TOKEN),
    EffectsModule.forFeature([FareConditionsEffect]),
  ],
  providers: [{ provide: FARE_CONDITIONS_REDUCER_TOKEN, useFactory: getDefaultFareConditionsReducer }],
})
export class FareConditionsStoreModule {
  public static forRoot<T extends FareConditionsState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<FareConditionsStoreModule> {
    return {
      ngModule: FareConditionsStoreModule,
      providers: [{ provide: FARE_CONDITIONS_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
