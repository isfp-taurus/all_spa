/**
 * ラウンジ申込画面 (R01-M051) ヘッダー
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonLibService, DialogDisplayService } from '@lib/services';
import { LoungeApplicationModalService } from './lounge-application-modal.service';
import { SupportModalIdSubComponent } from '@lib/components/support-class/support-modal-id-sub-component';
import { SERVICE_APPLICATION_CANCEL_MESSAGE_ID } from '../service-application-modal.state';
import { DialogClickType } from '@lib/interfaces';
import { LoungeApplicationModalPayload } from '../service-application-modal-payload.state';
@Component({
  selector: 'asw-lounge-application-modal-header',
  templateUrl: './lounge-application-modal-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoungeApplicationModalHeaderComponent extends SupportModalIdSubComponent {
  reload() {}
  init() {}
  destroy() {}
  constructor(
    private _common: CommonLibService,
    public service: LoungeApplicationModalService,
    private _dialogService: DialogDisplayService,
    public change: ChangeDetectorRef
  ) {
    super(_common);
  }
  public override payload: LoungeApplicationModalPayload | null = {};

  /**
   * 閉じるボタン押下処理
   */
  clickClose() {
    if (this.service.updateInfo.segment.some((seg) => seg.updateSegmentFlag === true)) {
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
      segment: [],
    });
    this.close();
  }
}
