import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AswContextEffect } from './asw-context.effect';
import { aswContextReducer } from './asw-context.reducer';
import { ASW_CONTEXT_STORE_NAME, AswContextState } from './asw-context.state';

/** Token of the AswContext reducer */
export const ASW_CONTEXT_REDUCER_TOKEN = new InjectionToken<ActionReducer<AswContextState, Action>>(
  'Feature AswContext Reducer'
);

/** Provide default reducer for AswContext store */
export function getDefaultAswContextReducer() {
  return aswContextReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(ASW_CONTEXT_STORE_NAME, ASW_CONTEXT_REDUCER_TOKEN),
    EffectsModule.forFeature([AswContextEffect]),
  ],
  providers: [{ provide: ASW_CONTEXT_REDUCER_TOKEN, useFactory: getDefaultAswContextReducer }],
})
export class AswContextStoreModule {
  public static forRoot<T extends AswContextState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<AswContextStoreModule> {
    return {
      ngModule: AswContextStoreModule,
      providers: [{ provide: ASW_CONTEXT_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
