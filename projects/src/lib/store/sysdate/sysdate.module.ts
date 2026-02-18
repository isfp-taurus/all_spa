import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { SysdateEffect } from './sysdate.effect';
import { sysdateReducer } from './sysdate.reducer';
import { SYSDATE_STORE_NAME, SysdateState } from './sysdate.state';

/** Token of the Sysdate reducer */
export const SYSDATE_REDUCER_TOKEN = new InjectionToken<ActionReducer<SysdateState, Action>>('Feature Sysdate Reducer');

/** Provide default reducer for Sysdate store */
export function getDefaultSysdateReducer() {
  return sysdateReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(SYSDATE_STORE_NAME, SYSDATE_REDUCER_TOKEN),
    EffectsModule.forFeature([SysdateEffect]),
  ],
  providers: [{ provide: SYSDATE_REDUCER_TOKEN, useFactory: getDefaultSysdateReducer }],
})
export class SysdateStoreModule {
  public static forRoot<T extends SysdateState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<SysdateStoreModule> {
    return {
      ngModule: SysdateStoreModule,
      providers: [{ provide: SYSDATE_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
