import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { RoundtripOwdDisplayEffect } from './roundtrip-owd-display.effect';
import { roundtripOwdDisplayReducer } from './roundtrip-owd-display.reducer';
import { ROUNDTRIP_OWD_DISPLAY_STORE_NAME, RoundtripOwdDisplayState } from './roundtrip-owd-display.state';

/** Token of the RoundtripOwdDisplay reducer */
export const ROUNDTRIP_OWD_DISPLAY_REDUCER_TOKEN = new InjectionToken<ActionReducer<RoundtripOwdDisplayState, Action>>(
  'Feature RoundtripOwdDisplay Reducer'
);

/** Provide default reducer for RoundtripOwdDisplay store */
export function getDefaultRoundtripOwdDisplayReducer() {
  return roundtripOwdDisplayReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(ROUNDTRIP_OWD_DISPLAY_STORE_NAME, ROUNDTRIP_OWD_DISPLAY_REDUCER_TOKEN),
    EffectsModule.forFeature([RoundtripOwdDisplayEffect]),
  ],
  providers: [{ provide: ROUNDTRIP_OWD_DISPLAY_REDUCER_TOKEN, useFactory: getDefaultRoundtripOwdDisplayReducer }],
})
export class RoundtripOwdDisplayStoreModule {
  public static forRoot<T extends RoundtripOwdDisplayState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<RoundtripOwdDisplayStoreModule> {
    return {
      ngModule: RoundtripOwdDisplayStoreModule,
      providers: [{ provide: ROUNDTRIP_OWD_DISPLAY_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
