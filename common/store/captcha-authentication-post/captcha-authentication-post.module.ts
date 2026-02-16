import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { CaptchaAuthenticationPostEffect } from './captcha-authentication-post.effect';
import { captchaAuthenticationPostReducer } from './captcha-authentication-post.reducer';
import {
  CAPTCHA_AUTHENTICATION_POST_STORE_NAME,
  CaptchaAuthenticationPostState,
} from './captcha-authentication-post.state';

/** Token of the CaptchaAuthenticationPost reducer */
export const CAPTCHA_AUTHENTICATION_POST_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<CaptchaAuthenticationPostState, Action>
>('Feature CaptchaAuthenticationPost Reducer');

/** Provide default reducer for CaptchaAuthenticationPost store */
export function getDefaultCaptchaAuthenticationPostReducer() {
  return captchaAuthenticationPostReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(CAPTCHA_AUTHENTICATION_POST_STORE_NAME, CAPTCHA_AUTHENTICATION_POST_REDUCER_TOKEN),
    EffectsModule.forFeature([CaptchaAuthenticationPostEffect]),
  ],
  providers: [
    { provide: CAPTCHA_AUTHENTICATION_POST_REDUCER_TOKEN, useFactory: getDefaultCaptchaAuthenticationPostReducer },
  ],
})
export class CaptchaAuthenticationPostStoreModule {
  public static forRoot<T extends CaptchaAuthenticationPostState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<CaptchaAuthenticationPostStoreModule> {
    return {
      ngModule: CaptchaAuthenticationPostStoreModule,
      providers: [{ provide: CAPTCHA_AUTHENTICATION_POST_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
