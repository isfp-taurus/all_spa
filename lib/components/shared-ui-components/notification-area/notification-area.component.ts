/**
 * 読み上げ文言通知用エリア
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonLibService, NotificationStoreService } from '../../../services';
import { SupportComponent } from '../../../components/support-class';

/**
 * 読み上げ文言通知用エリア
 */
@Component({
  selector: 'asw-notification-area',
  templateUrl: './notification-area.component.html',
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationAreaComponent extends SupportComponent {
  constructor(
    private _common: CommonLibService,
    private _notificationStoreService: NotificationStoreService,
    private _changeDetector: ChangeDetectorRef
  ) {
    super(_common);
  }

  public assertMessage = '';
  public politeMessage = '';

  init() {
    this.subscribeService(
      'NotificationAreaComponent_getNotificationObservable',
      this._notificationStoreService.getNotification$(),
      (state) => {
        this.assertMessage = state.assertMessage;
        this.politeMessage = state.politeMessage;
        this._changeDetector.markForCheck();
      }
    );
  }
  destroy() {}
  reload() {}
}
