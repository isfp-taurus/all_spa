import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * プラン操作メニューモーダル
 */
@Component({
  selector: 'asw-plan-manipulation-menu-modal',
  templateUrl: './plan-review-plan-manipulation-menu-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewPlanManipulationMenuModalComponent extends SupportModalBlockComponent {
  constructor(private _common: CommonLibService) {
    super(_common);
  }

  /** 操作中プラン未保存判定 */
  public isUnsaved = true;

  /** 操作中カート保存済み判定 */
  public isPlanValid = false;

  reload(): void {}

  init(): void {
    this.isUnsaved = this.payload.isUnsaved;
    this.isPlanValid = this.payload.isPlanValid;
  }

  destroy(): void {}

  /** 閉じるボタン押下時処理 */
  clickClose() {
    this.close();
  }
}
