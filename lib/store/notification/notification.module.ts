import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { notificationReducer } from './notification.reducer';
import { NOTIFICATION_STORE_NAME, NotificationState } from './notification.state';

/** Token of the Notification reducer */
export const NOTIFICATION_REDUCER_TOKEN = new InjectionToken<ActionReducer<NotificationState, Action>>(
  'Feature Notification Reducer'
);

/** Provide default reducer for Notification store */
export function getDefaultNotificationReducer() {
  return notificationReducer;
}

@NgModule({
  imports: [StoreModule.forFeature(NOTIFICATION_STORE_NAME, NOTIFICATION_REDUCER_TOKEN)],
  providers: [{ provide: NOTIFICATION_REDUCER_TOKEN, useFactory: getDefaultNotificationReducer }],
})
export class NotificationStoreModule {
  public static forRoot<T extends NotificationState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<NotificationStoreModule> {
    return {
      ngModule: NotificationStoreModule,
      providers: [{ provide: NOTIFICATION_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
