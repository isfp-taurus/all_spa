import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { alertMessageReducer } from './alert-message.reducer';
import { ALERT_MESSAGE_STORE_NAME, AlertMessageState } from './alert-message.state';

/** Token of the AlertMessage reducer */
export const ALERT_MESSAGE_REDUCER_TOKEN = new InjectionToken<ActionReducer<AlertMessageState, Action>>(
  'Feature AlertMessage Reducer'
);

/** Provide default reducer for AlertMessage store */
export function getDefaultAlertMessageReducer() {
  return alertMessageReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(ALERT_MESSAGE_STORE_NAME, ALERT_MESSAGE_REDUCER_TOKEN)],
  providers: [{ provide: ALERT_MESSAGE_REDUCER_TOKEN, useFactory: getDefaultAlertMessageReducer }],
})
export class AlertMessageStoreModule {
  public static forRoot<T extends AlertMessageState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<AlertMessageStoreModule> {
    return {
      ngModule: AlertMessageStoreModule,
      providers: [{ provide: ALERT_MESSAGE_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
