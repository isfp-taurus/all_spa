import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { Router } from '@angular/router';
import { LoginStatusType } from '@lib/interfaces';
import { PlanListCurrentPlan, PlanListSelect } from '@common/interfaces';
import { RoutesResRoutes } from '@conf/routes.config';

@Component({
  selector: 'asw-plan-list-pres',
  templateUrl: './plan-list-pres.component.html',
  styleUrls: ['plan-list-pres.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanListPresComponent extends SupportComponent {
  /* 表示用プランリスト */
  @Input()
  set displayPlanList(displayPlanList: Array<PlanListCurrentPlan>) {
    this.initialFunc(displayPlanList);
  }
  /* プラン取得処理完了フラグ */
  @Input()
  finishGetPlan: boolean = false;
  /* カート取得処理完了フラグ */
  @Input()
  finishGetCart: boolean = false;
  /* プラン差分フラグ */
  @Input()
  isPlanChanged: boolean = false;

  /* プラン確認画面遷移処理 */
  @Output()
  public setInfoToPlanReview: EventEmitter<{ index: number }> = new EventEmitter<{ index: number }>();
  /* プラン操作メニューモーダル表示 */
  @Output()
  public openPlanOperationModal: EventEmitter<{ selectPlan: PlanListCurrentPlan }> = new EventEmitter<{
    selectPlan: PlanListCurrentPlan;
  }>();
  /* プラン操作メニューモーダル表示 */
  @Output()
  public deletePlan: EventEmitter<{ cartIds: Array<string> }> = new EventEmitter<{ cartIds: Array<string> }>();

  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router
  ) {
    super(_common);
  }

  /* 表示用プランリスト */
  displayPlans: Array<PlanListCurrentPlan> = [];
  /* プラン全選択フラグ */
  isSelectAll: boolean = false;
  /* プラン選択フラグリスト */
  select: Array<PlanListSelect> = [];
  /* 選択中プラン数 */
  countPlans: number = 0;
  /* プランゼロフラグ */
  isPlanZero: boolean = false;
  /* マージ案内フラグ */
  isNeedToLogin: boolean = false;

  /* 初期表示時処理 */
  init(): void {}
  /* 画面終了時処理 */
  destroy(): void {}
  /* 画面更新時処理 */
  reload(): void {}

  //初期表示処理 ※init()だとcont側のawaitを待たずに動き出してしまうため、タイミングを制御
  public initialFunc(displayPlanList: Array<PlanListCurrentPlan>) {
    this.displayPlans = displayPlanList;
    const loginStatus = this._common.aswContextStoreService.aswContextData.loginStatus;
    this.isPlanZero = false;
    this.countPlans = 0;

    /* マージ案内フラグ */
    this.isNeedToLogin = loginStatus === LoginStatusType.NOT_LOGIN && displayPlanList.length !== 0;

    /* プラン0件フラグ */
    this.isPlanZero = displayPlanList.length === 0;

    /* プラン選択チェックボックス/操作メニューボタンID採番 */
    this.select = displayPlanList.map((plan, index) => {
      return {
        index: index,
        name: 'select' + index,
        checked: false,
        cartId: plan.cartId ?? '',
      };
    });

    //画面の再描写
    this._changeDetectorRef.markForCheck();
  }

  /* 全て選択値変更処理 */
  public changeAllSelectCheck(isAllSelect: boolean) {
    this.select.forEach((item) => {
      item.checked = isAllSelect;
    });
    this.countPlans = isAllSelect ? this.select.length : 0;
    this.isSelectAll = isAllSelect;
  }

  /* プラン選択チェックボックス処理 */
  public changeSelectPlan(id: string, check: boolean) {
    this.select
      .filter((item) => item.name === id)
      .forEach((item) => {
        item.checked = check;
      });
    this.isSelectAll = !this.select.some((item) => !item.checked);
    this.countPlans += check ? 1 : -1;
  }

  /* プラン確認画面遷移処理 */
  public goToPlanReview(index: number) {
    // プラン確認画面へ引き渡す情報をstoreにセット
    this.setInfoToPlanReview.emit({ index });

    // プラン確認画面遷移
    this._router.navigateByUrl('plan-review');
    this._router.navigateByUrl(RoutesResRoutes.PLAN_REVIEW);
  }

  public clickMenu(selectPlan: PlanListCurrentPlan) {
    // プラン操作メニューモーダル表示
    this.openPlanOperationModal.emit({ selectPlan });
  }

  /* 選択中プラン削除ボタン押下処理 */
  clickDelete(cartIds: Array<string>) {
    // プラン削除実行処理
    this.deletePlan.emit({ cartIds });
  }
}
