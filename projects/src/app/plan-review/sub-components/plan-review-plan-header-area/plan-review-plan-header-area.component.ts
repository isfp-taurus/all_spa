import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PlanReviewPlanHeaderAreaData } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { AppConstants } from '@conf/app.constants';

@Component({
  selector: 'asw-plan-review-plan-header-area',
  templateUrl: './plan-review-plan-header-area.component.html',
  styleUrls: ['./plan-review-plan-header-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewPlanHeaderAreaComponent extends SupportComponent {
  public appConstants = AppConstants;

  /** プラン保存済み判定 */
  @Input() isUnsaved = true;

  /** 差分強調表示有無 */
  @Input() isPlanChanged = false;

  /** プラン有効判定 */
  @Input() isPlanValid = false;

  /** 操作中プラン情報 */
  @Input() planHeaderAreaData: PlanReviewPlanHeaderAreaData = {};

  /**
   * コンストラクタ
   */
  constructor(private _common: CommonLibService) {
    super(_common);
  }

  init(): void {}

  refresh(): void {}

  reload(): void {}

  destroy(): void {}
}
