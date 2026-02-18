import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { SignalService } from '@lib/components/shared-ui-components/amc-login/signal.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { PlanListStoreService } from '@common/services';
import { PlanListModel } from '@common/store';

@Component({
  selector: 'asw-merge-confirm-modal',
  templateUrl: './merge-confirm-modal.component.html',
  styleUrls: ['./merge-confirm-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MergeConfirmModalComponent extends SupportModalBlockComponent {
  constructor(
    private _common: CommonLibService,
    private _signalService: SignalService,
    private _planListStoreService: PlanListStoreService
  ) {
    super(_common);
  }

  private subscription: Subscription | undefined;

  mergeRadioFc = new FormControl('1');

  init(): void {
    if (!this.subscription?.closed) {
      this.subscription = this._signalService.mergeConfirmSignal$.subscribe(() => {
        if (this._signalService.isMergeConfirm && this.payload.mergeEvent) {
          console.log('mergeConfirm');
          this.payload.mergeEvent();
        } else {
          console.log('not mergeConfirm');
        }
        this.subscription?.unsubscribe();
      });
    }
  }

  reload(): void {}
  destroy(): void {}

  /** 続けるボタン押下時処理 */
  clickContinue() {
    if (this.mergeRadioFc.value === '1') {
      const param: PlanListModel = {
        planList: this._planListStoreService.PlanListData.planList,
        isPlanMerge: true,
      };
      this._planListStoreService.setPlanList(param);
    }
    this._signalService.isMergeConfirm = this.mergeRadioFc.value === '1';
    this._signalService.sendLoginSignal();
    this.close();
  }

  /** 閉じるボタン押下時処理 */
  clickClose() {
    this._signalService.isMergeConfirm = false;
    this.subscription?.unsubscribe();
    this.close();
  }
}
