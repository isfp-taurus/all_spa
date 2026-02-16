import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { RoundtripFppEffect } from './roundtrip-fpp.effect';
import { roundtripFppReducer } from './roundtrip-fpp.reducer';
import { ROUNDTRIP_FPP_STORE_NAME, RoundtripFppState } from './roundtrip-fpp.state';

/** Token of the RoundtripFpp reducer */
export const ROUNDTRIP_FPP_REDUCER_TOKEN = new InjectionToken<ActionReducer<RoundtripFppState, Action>>(
  'Feature RoundtripFpp Reducer'
);

/** Provide default reducer for RoundtripFpp store */
export function getDefaultRoundtripFppReducer() {
  return roundtripFppReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(ROUNDTRIP_FPP_STORE_NAME, ROUNDTRIP_FPP_REDUCER_TOKEN),
    EffectsModule.forFeature([RoundtripFppEffect]),
  ],
  providers: [{ provide: ROUNDTRIP_FPP_REDUCER_TOKEN, useFactory: getDefaultRoundtripFppReducer }],
})
export class RoundtripFppStoreModule {
  public static forRoot<T extends RoundtripFppState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<RoundtripFppStoreModule> {
    return {
      ngModule: RoundtripFppStoreModule,
      providers: [{ provide: ROUNDTRIP_FPP_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
