import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AuthLoginEffect } from './auth-login.effect';
import { authLoginReducer } from './auth-login.reducer';
import { AUTH_LOGIN_STORE_NAME, AuthLoginState } from './auth-login.state';

/** Token of the AuthLogin reducer */
export const AUTH_LOGIN_REDUCER_TOKEN = new InjectionToken<ActionReducer<AuthLoginState, Action>>(
  'Feature AuthLogin Reducer'
);

/** Provide default reducer for AuthLogin store */
export function getDefaultAuthLoginReducer() {
  return authLoginReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(AUTH_LOGIN_STORE_NAME, AUTH_LOGIN_REDUCER_TOKEN),
    EffectsModule.forFeature([AuthLoginEffect]),
  ],
  providers: [{ provide: AUTH_LOGIN_REDUCER_TOKEN, useFactory: getDefaultAuthLoginReducer }],
})
export class AuthLoginStoreModule {
  public static forRoot<T extends AuthLoginState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<AuthLoginStoreModule> {
    return {
      ngModule: AuthLoginStoreModule,
      providers: [{ provide: AUTH_LOGIN_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
