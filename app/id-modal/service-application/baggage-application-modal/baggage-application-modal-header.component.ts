/**
 * 手荷物申込画面 (R01-M052)　ヘッダー
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonLibService, DialogDisplayService } from '@lib/services';
import { BaggageApplicationModalService } from './baggage-application-modal.service';
import { SupportModalIdSubComponent } from '@lib/components/support-class/support-modal-id-sub-component';
import { SERVICE_APPLICATION_CANCEL_MESSAGE_ID } from '../service-application-modal.state';
import { DialogClickType } from '@lib/interfaces';
import { BaggageApplicationModalPayload } from '../service-application-modal-payload.state';

@Component({
  selector: 'asw-baggage-application-modal-header',
  templateUrl: './baggage-application-modal-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaggageApplicationModalHeaderComponent extends SupportModalIdSubComponent {
  reload() {}
  init() {}
  destroy() {}
  constructor(
    private _common: CommonLibService,
    public service: BaggageApplicationModalService,
    private _dialogService: DialogDisplayService,
    public change: ChangeDetectorRef
  ) {
    super(_common);
  }
  public override payload: BaggageApplicationModalPayload | null = {};

  /**
   * 閉じるボタン押下処理
   */
  clickClose() {
    if (this.service.updateInfo.bounds.some((bound) => bound.isBoundUpdate === true)) {
      const ret = this._dialogService.openDialog({
        message: SERVICE_APPLICATION_CANCEL_MESSAGE_ID,
      });
      this.subscribeService('confirmDialogClick', ret.buttonClick$, (result) => {
        if (result.clickType === DialogClickType.CONFIRM) {
          this.clickCloseSub();
        }
      });
    } else {
      this.clickCloseSub();
    }
  }

  /**
   * 閉じる処理
   */
  clickCloseSub() {
    this.service.setUpdateInfo({
      bounds: [],
    });
    this.close();
  }
}
