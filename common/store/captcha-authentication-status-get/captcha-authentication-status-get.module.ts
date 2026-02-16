import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CaptchaAuthenticationStatusGetEffect } from './captcha-authentication-status-get.effect';
import { captchaAuthenticationStatusGetReducer } from './captcha-authentication-status-get.reducer';
import {
  CAPTCHA_AUTHENTICATION_STATUS_GET_STORE_NAME,
  CaptchaAuthenticationStatusGetState,
} from './captcha-authentication-status-get.state';

/** Token of the CaptchaAuthenticationStatusGet reducer */
export const CAPTCHA_AUTHENTICATION_STATUS_GET_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<CaptchaAuthenticationStatusGetState, Action>
>('Feature CaptchaAuthenticationStatusGet Reducer');

/** Provide default reducer for CaptchaAuthenticationStatusGet store */
export function getDefaultCaptchaAuthenticationStatusGetReducer() {
  return captchaAuthenticationStatusGetReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(
      CAPTCHA_AUTHENTICATION_STATUS_GET_STORE_NAME,
      CAPTCHA_AUTHENTICATION_STATUS_GET_REDUCER_TOKEN
    ),
    EffectsModule.forFeature([CaptchaAuthenticationStatusGetEffect]),
  ],
  providers: [
    {
      provide: CAPTCHA_AUTHENTICATION_STATUS_GET_REDUCER_TOKEN,
      useFactory: getDefaultCaptchaAuthenticationStatusGetReducer,
    },
  ],
})
export class CaptchaAuthenticationStatusGetStoreModule {
  public static forRoot<T extends CaptchaAuthenticationStatusGetState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<CaptchaAuthenticationStatusGetStoreModule> {
    return {
      ngModule: CaptchaAuthenticationStatusGetStoreModule,
      providers: [{ provide: CAPTCHA_AUTHENTICATION_STATUS_GET_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
