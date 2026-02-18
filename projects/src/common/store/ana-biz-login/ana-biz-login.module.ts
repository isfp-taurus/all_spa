import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { AnaBizLoginEffect } from './ana-biz-login.effect';
import { anaBizLoginReducer } from './ana-biz-login.reducer';
import { ANA_BIZ_LOGIN_STORE_NAME, AnaBizLoginState } from './ana-biz-login.state';

/** Token of the AnaBizLogin reducer */
export const ANA_BIZ_LOGIN_REDUCER_TOKEN = new InjectionToken<ActionReducer<AnaBizLoginState, Action>>(
  'Feature AnaBizLogin Reducer'
);

/** Provide default reducer for AnaBizLogin store */
export function getDefaultAnaBizLoginReducer() {
  return anaBizLoginReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(ANA_BIZ_LOGIN_STORE_NAME, ANA_BIZ_LOGIN_REDUCER_TOKEN),
    EffectsModule.forFeature([AnaBizLoginEffect]),
  ],
  providers: [{ provide: ANA_BIZ_LOGIN_REDUCER_TOKEN, useFactory: getDefaultAnaBizLoginReducer }],
})
export class AnaBizLoginStoreModule {
  public static forRoot<T extends AnaBizLoginState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<AnaBizLoginStoreModule> {
    return {
      ngModule: AnaBizLoginStoreModule,
      providers: [{ provide: ANA_BIZ_LOGIN_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
