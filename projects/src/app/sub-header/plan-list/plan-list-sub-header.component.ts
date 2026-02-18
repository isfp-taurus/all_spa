import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonLibService } from '@lib/services';
import { SupportComponent } from '@lib/components/support-class';
import { PlansCreatePlansRequest, PlansCreatePlansRequestPlansInner } from 'src/sdk-reservation';
import { LoginStatusType } from '@lib/interfaces';
import { PlanListModel } from '@common/store/plan-list';
import { PlanListService, PlanListStoreService } from '@common/services';
import { PlanListCurrentPlan } from '@common/interfaces';

//プロパティ情報

/**
 * サブヘッダー
 */
@Component({
  selector: 'asw-plan-list-sub-header',
  templateUrl: './plan-list-sub-header.component.html',
  providers: [],
})
export class PlanListSubHeaderComponent extends SupportComponent {
  constructor(
    private _common: CommonLibService,
    private _planListStoreService: PlanListStoreService,
    private _changeDetector: ChangeDetectorRef,
    private _planListService: PlanListService
  ) {
    super(_common);
  }

  /* 表示用プランリスト */
  displayPlanList: Array<PlanListCurrentPlan> = [];
  /* プランゼロフラグ */
  isPlanZero: boolean = false;

  reload(): void {}
  init(): void {
    this.subscribeService(
      'PlanListSubHeaderComponent afterPlanListContInit',
      this._planListStoreService.getPlanList$(),
      (data) => {
        if (data.isNeedRefresh) {
          this.displayPlanList = data.planList ?? [];
          const loginStatus = this._common.aswContextStoreService.aswContextData.loginStatus;
          const currentPlan = data.planList;
          if (currentPlan?.length !== 0 && loginStatus === LoginStatusType.NOT_LOGIN) {
            this.isPlanZero = true;
          } else {
            this.isPlanZero = false;
          }

          this._changeDetector.markForCheck();

          const plaListInfo: PlanListModel = {
            planList: this.displayPlanList,
            isNeedRefresh: false,
          };
          this._planListStoreService.setPlanList(plaListInfo);
        }
      }
    );
  }
  destroy(): void {}

  /* 他端末引継ぎボタン押下処理 */
  mergePlanList() {
    const plansList: Array<PlansCreatePlansRequestPlansInner> = this.displayPlanList.map(
      (plan: PlanListCurrentPlan) => {
        return {
          cartId: plan.cartId ?? '',
          creationPointOfSaleId: plan.planData?.creationPointOfSaleId ?? '',
          planName: plan.planName ?? '',
          isUnsaved: plan.planData?.isUnsaved ?? false,
        };
      }
    );
    const requestParameter: PlansCreatePlansRequest = {
      plans: plansList,
      processType: 'temporarySaveForMigrate',
    };

    // プラン作成API実行処理
    this._planListService.createPlansAPI(requestParameter, (response) => {
      this._planListService.openTemporaryUrlModal(response);
    });
  }
}
