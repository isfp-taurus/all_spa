import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { GetEncryptedLoginInfoEffect } from './get-encrypted-login-info.effect';
import { getEncryptedLoginInfoReducer } from './get-encrypted-login-info.reducer';
import { GET_ENCRYPTED_LOGIN_INFO_STORE_NAME, GetEncryptedLoginInfoState } from './get-encrypted-login-info.state';

/** Token of the GetEncryptedLoginInfo reducer */
export const GET_ENCRYPTED_LOGIN_INFO_REDUCER_TOKEN = new InjectionToken<
  ActionReducer<GetEncryptedLoginInfoState, Action>
>('Feature GetEncryptedLoginInfo Reducer');

/** Provide default reducer for GetEncryptedLoginInfo store */
export function getDefaultGetEncryptedLoginInfoReducer() {
  return getEncryptedLoginInfoReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(GET_ENCRYPTED_LOGIN_INFO_STORE_NAME, GET_ENCRYPTED_LOGIN_INFO_REDUCER_TOKEN),
    EffectsModule.forFeature([GetEncryptedLoginInfoEffect]),
  ],
  providers: [{ provide: GET_ENCRYPTED_LOGIN_INFO_REDUCER_TOKEN, useFactory: getDefaultGetEncryptedLoginInfoReducer }],
})
export class GetEncryptedLoginInfoStoreModule {
  public static forRoot<T extends GetEncryptedLoginInfoState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<GetEncryptedLoginInfoStoreModule> {
    return {
      ngModule: GetEncryptedLoginInfoStoreModule,
      providers: [{ provide: GET_ENCRYPTED_LOGIN_INFO_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
