import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { planSaveModalParts } from '@common/components';
import { CurrentCartModel } from '@common/store/current-cart';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService, ModalService } from '@lib/services';

/**
 * プラン保存エリア
 */
@Component({
  selector: 'asw-plan-review-plan-save-area',
  templateUrl: './plan-review-plan-save-area.component.html',
  styleUrls: ['./plan-review-plan-save-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewPlanSaveAreaComponent extends SupportComponent {
  /** プラン有効判定 */
  @Input() isPlanValid = false;

  /** 操作中カート情報 */
  @Input() currentCart: CurrentCartModel = {};

  constructor(private _common: CommonLibService, private _modalService: ModalService) {
    super(_common);
  }

  reload(): void {}
  init(): void {}
  destroy(): void {}

  /**
   * プラン保存モーダル表示処理
   */
  openPlanSaveModal(): void {
    const parts = planSaveModalParts();
    parts.payload = {
      cartId: this.currentCart.data?.cartId ?? '',
      planName: '',
      creationDate: this.currentCart.data?.creationDate,
      isUnsaved: true,
    };
    this._modalService.showSubModal(parts);
  }
}
