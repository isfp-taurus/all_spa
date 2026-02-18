import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { RoundtripOwdEffect } from './roundtrip-owd.effect';
import { roundtripOwdReducer } from './roundtrip-owd.reducer';
import { ROUNDTRIP_OWD_STORE_NAME, RoundtripOwdState } from './roundtrip-owd.state';

/** Token of the RoundtripOwd reducer */
export const ROUNDTRIP_OWD_REDUCER_TOKEN = new InjectionToken<ActionReducer<RoundtripOwdState, Action>>(
  'Feature RoundtripOwd Reducer'
);

/** Provide default reducer for RoundtripOwd store */
export function getDefaultRoundtripOwdReducer() {
  return roundtripOwdReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(ROUNDTRIP_OWD_STORE_NAME, ROUNDTRIP_OWD_REDUCER_TOKEN),
    EffectsModule.forFeature([RoundtripOwdEffect]),
  ],
  providers: [{ provide: ROUNDTRIP_OWD_REDUCER_TOKEN, useFactory: getDefaultRoundtripOwdReducer }],
})
export class RoundtripOwdStoreModule {
  public static forRoot<T extends RoundtripOwdState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<RoundtripOwdStoreModule> {
    return {
      ngModule: RoundtripOwdStoreModule,
      providers: [{ provide: ROUNDTRIP_OWD_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
