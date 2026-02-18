/**
 * 通知エリア制御用 store サービス
 */
import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { SupportClass } from '../../components/support-class';
import {
  selectNotificationState,
  setNotification,
  NotificationState,
  NotificationStore,
  updateNotification,
} from '../../store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';

/**
 * 通知エリア制御用 store サービス
 */
@Injectable()
export class NotificationStoreService extends SupportClass {
  public notification$: Observable<NotificationState>;
  public notificationData!: NotificationState;

  constructor(private _store: Store<NotificationStore>) {
    super();
    this.notification$ = this._store.pipe(
      select(selectNotificationState),
      filter((data) => !!data)
    );
    this.subscribeService('NotificationStoreServiceData', this.notification$, (data) => {
      this.notificationData = data;
    });
  }

  destroy() {}

  public getNotification$() {
    return this.notification$;
  }

  public updateNotification(value: Partial<NotificationState>) {
    this._store.dispatch(updateNotification(value));
  }

  public setNotification(value: NotificationState) {
    this._store.dispatch(setNotification(value));
  }
}
