import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AnaBizContextEffect } from './ana-biz-context.effect';
import { anaBizContextReducer } from './ana-biz-context.reducer';
import { ANA_BIZ_CONTEXT_STORE_NAME, AnaBizContextState } from './ana-biz-context.state';

/** Token of the AnaBizContext reducer */
export const ANA_BIZ_CONTEXT_REDUCER_TOKEN = new InjectionToken<ActionReducer<AnaBizContextState, Action>>(
  'Feature AnaBizContext Reducer'
);

/** Provide default reducer for AnaBizContext store */
export function getDefaultAnaBizContextReducer() {
  return anaBizContextReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(ANA_BIZ_CONTEXT_STORE_NAME, ANA_BIZ_CONTEXT_REDUCER_TOKEN),
    EffectsModule.forFeature([AnaBizContextEffect]),
  ],
  providers: [{ provide: ANA_BIZ_CONTEXT_REDUCER_TOKEN, useFactory: getDefaultAnaBizContextReducer }],
})
export class AnaBizContextStoreModule {
  public static forRoot<T extends AnaBizContextState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<AnaBizContextStoreModule> {
    return {
      ngModule: AnaBizContextStoreModule,
      providers: [{ provide: ANA_BIZ_CONTEXT_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
