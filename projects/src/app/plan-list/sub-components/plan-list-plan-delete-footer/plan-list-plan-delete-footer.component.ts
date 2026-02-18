import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PlanListCurrentPlan, PlanListSelect } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * plan-list-plan-delete-footer
 * 選択中プラン削除フッタ
 */
@Component({
  selector: 'asw-plan-list-plan-delete-footer',
  templateUrl: './plan-list-plan-delete-footer.component.html',
  styleUrls: ['plan-list-plan-delete-footer.component.scss'],
  providers: [],
})
export class PlanListPlanDeleteFooterComponent extends SupportComponent {
  /* プラン選択フラグリスト */
  @Input()
  public displayPlanList: Array<PlanListCurrentPlan> = [];
  /* 選択プラン情報 */
  @Input()
  public select: Array<PlanListSelect> = [];
  /* 選択中プラン数 */
  @Input()
  public countPlans: number = 0;

  /* 全て選択チェックボックス処理 */
  @Output()
  public deletePlans: EventEmitter<{ cartIds: Array<string> }> = new EventEmitter<{ cartIds: Array<string> }>();

  constructor(private _common: CommonLibService) {
    super(_common);
  }

  init(): void {}
  reload(): void {}
  destroy(): void {}

  /** 削除ボタン押下処理 */
  clickDelete() {
    const deleteCartIds = this.select.filter((o) => o.checked).map((o) => o.cartId);
    // 選択中プラン削除処理
    this.deletePlans.emit({ cartIds: deleteCartIds });
  }
}
