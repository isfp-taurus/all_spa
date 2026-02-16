import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { appInfoReducer } from './app-info.reducer';
import { APP_INFO_STORE_NAME, AppInfoState } from './app-info.state';

/** Token of the AppInfo reducer */
export const APP_INFO_REDUCER_TOKEN = new InjectionToken<ActionReducer<AppInfoState, Action>>(
  'Feature AppInfo Reducer'
);

/** Provide default reducer for AppInfo store */
export function getDefaultAppInfoReducer() {
  return appInfoReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(APP_INFO_STORE_NAME, APP_INFO_REDUCER_TOKEN)],
  providers: [{ provide: APP_INFO_REDUCER_TOKEN, useFactory: getDefaultAppInfoReducer }],
})
export class AppInfoStoreModule {
  public static forRoot<T extends AppInfoState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<AppInfoStoreModule> {
    return {
      ngModule: AppInfoStoreModule,
      providers: [{ provide: APP_INFO_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
