/**
 * 機内食申込画面 (R01-M053) ヘッダー
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { CommonLibService, DialogDisplayService } from '@lib/services';
import { MealApplicationModalService } from './meal-application-modal.service';
import { SupportModalIdSubComponent } from '@lib/components/support-class/support-modal-id-sub-component';
import { MealApplicationModalPayload } from '../service-application-modal-payload.state';
import { SERVICE_APPLICATION_CANCEL_MESSAGE_ID } from '../service-application-modal.state';
import { DialogClickType } from '@lib/interfaces';
@Component({
  selector: 'asw-meal-application-modal-header',
  templateUrl: './meal-application-modal-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealApplicationModalHeaderComponent extends SupportModalIdSubComponent {
  reload() {}
  init() {}
  destroy() {}
  constructor(
    private _common: CommonLibService,
    public service: MealApplicationModalService,
    private _dialogService: DialogDisplayService,
    public change: ChangeDetectorRef
  ) {
    super(_common);
  }
  public override payload: MealApplicationModalPayload | null = {};

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
