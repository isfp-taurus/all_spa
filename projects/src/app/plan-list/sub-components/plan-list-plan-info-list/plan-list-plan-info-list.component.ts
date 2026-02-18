import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { PlanListCurrentPlan, PlanListSelect } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * plan-list-plan-info-list
 * プラン情報一覧
 */
@Component({
  selector: 'asw-plan-list-plan-info-list',
  templateUrl: './plan-list-plan-info-list.component.html',
  styleUrls: ['plan-list-plan-info-list.component.scss'],
  providers: [],
})
export class PlanListPlanInfoListComponent extends SupportComponent {
  /* 表示用プランリスト */
  @Input()
  displayPlanList: Array<PlanListCurrentPlan> = [];
  /* プラン取得処理完了フラグ */
  @Input()
  set finishGetPlan(finishGetPlan: boolean) {
    this.refresh(finishGetPlan);
  }
  /* カート取得処理完了フラグ */
  @Input()
  set finishGetCart(finishGetCart: boolean) {
    this.finishload(finishGetCart);
  }
  // finishGetCart: boolean = false;
  /* プラン選択チェックボックス情報 */
  @Input()
  select: Array<PlanListSelect> = [];
  /* プラン0件フラグ */
  @Input()
  public isPlanZero: boolean = false;
  /* プラン全選択フラグ */
  @Input()
  public isSelectAll: boolean = false;

  /* 全て選択チェックボックス処理 */
  @Output()
  public changeAllselect: EventEmitter<{ checked: boolean }> = new EventEmitter<{ checked: boolean }>();
  /* プラン選択チェックボックス処理 */
  @Output()
  public changeSelect: EventEmitter<{ id: string; check: boolean }> = new EventEmitter<{
    id: string;
    check: boolean;
  }>();
  /* プラン操作メニューモーダル表示処理 */
  @Output()
  public openPlanOperationModal: EventEmitter<{ selectPlan: PlanListCurrentPlan }> = new EventEmitter<{
    selectPlan: PlanListCurrentPlan;
  }>();
  /* プラン確認画面遷移処理 */
  @Output()
  public goToPlanReview: EventEmitter<{ index: number }> = new EventEmitter<{ index: number }>();

  /* 表示用プランリスト */
  displayPlans: Array<PlanListCurrentPlan> = [];
  /* プラン取得処理完了フラグ */
  afterGetPlans: boolean = false;
  /* カート取得処理完了フラグ */
  afterGetCart: boolean = false;
  /* チェックボックス活性フラグ */
  checkDisabled: boolean = true;

  constructor(private _common: CommonLibService, private _changeDetectorRef: ChangeDetectorRef) {
    super(_common);
  }

  init(): void {}
  reload(): void {}
  destroy(): void {}

  /* 遅延ロード切替 */
  refresh(finishGetPlan: boolean) {
    this.afterGetPlans = finishGetPlan;
    /* プラン選択チェックボックス/操作メニューボタンID採番 */
    this.select = this.displayPlanList.map((plan, index) => {
      return {
        index: index,
        name: 'select' + index,
        checked: false,
        cartId: plan.cartId ?? '',
      };
    });
    //画面の再描写
    this._changeDetectorRef.markForCheck();
    this._changeDetectorRef.detectChanges();
  }

  /* 遅延ローディング全完了後処理 */
  finishload(finishGetCart: boolean) {
    this.afterGetCart = finishGetCart;
    if (finishGetCart) {
      this.checkDisabled = false;
    }
  }

  /* 全て選択チェックボックスイベント */
  checkAllSelect(event: Event) {
    const { checked: checke } = event.target as HTMLInputElement;
    this.changeAllselect.emit({ checked: checke });
  }

  /* プラン選択チェックボックスイベント */
  selectPlan(id: string, check: boolean) {
    this.changeSelect.emit({ id, check });
  }

  /* プラン選択チェックボックスイベント */
  clickMenu(selectPlan: PlanListCurrentPlan) {
    this.openPlanOperationModal.emit({ selectPlan });
  }
  /* プラン選択チェックボックスイベント */
  clickDetail(index: number) {
    this.goToPlanReview.emit({ index });
  }
}
