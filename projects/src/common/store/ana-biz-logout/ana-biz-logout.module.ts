import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AnaBizLogoutEffect } from './ana-biz-logout.effect';
import { anaBizLogoutReducer } from './ana-biz-logout.reducer';
import { ANA_BIZ_LOGOUT_STORE_NAME, AnaBizLogoutState } from './ana-biz-logout.state';

/** Token of the AnaBizLogout reducer */
export const ANA_BIZ_LOGOUT_REDUCER_TOKEN = new InjectionToken<ActionReducer<AnaBizLogoutState, Action>>(
  'Feature AnaBizLogout Reducer'
);

/** Provide default reducer for AnaBizLogout store */
export function getDefaultAnaBizLogoutReducer() {
  return anaBizLogoutReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(ANA_BIZ_LOGOUT_STORE_NAME, ANA_BIZ_LOGOUT_REDUCER_TOKEN),
    EffectsModule.forFeature([AnaBizLogoutEffect]),
  ],
  providers: [{ provide: ANA_BIZ_LOGOUT_REDUCER_TOKEN, useFactory: getDefaultAnaBizLogoutReducer }],
})
export class AnaBizLogoutStoreModule {
  public static forRoot<T extends AnaBizLogoutState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<AnaBizLogoutStoreModule> {
    return {
      ngModule: AnaBizLogoutStoreModule,
      providers: [{ provide: ANA_BIZ_LOGOUT_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
