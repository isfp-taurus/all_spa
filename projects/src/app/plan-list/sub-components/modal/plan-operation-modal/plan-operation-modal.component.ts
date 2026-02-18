import { ChangeDetectionStrategy, Component } from '@angular/core';
import { planSaveModalParts } from '@common/components';
import { LocalPlanService, PlanListService, PlanListStoreService } from '@common/services';
import { PlanListModel } from '@common/store';
import { SupportModalBlockComponent } from '@lib/components/support-class';
import { DialogClickType, LoginStatusType } from '@lib/interfaces';
import { CommonLibService, DialogDisplayService, ModalService } from '@lib/services';
import { PlansDeletePlansRequest, PlansGetPlansResponsePlansInner } from 'src/sdk-reservation';

/**
 * plan-operation-modal
 * プラン操作メニューモーダル
 */
@Component({
  selector: 'asw-plan-operation-modal',
  templateUrl: './plan-operation-modal.component.html',
  styleUrls: ['./plan-operation-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanOperationModalComponent extends SupportModalBlockComponent {
  constructor(
    private _common: CommonLibService,
    private _localPlanService: LocalPlanService,
    private _planListService: PlanListService,
    private _dialogSvc: DialogDisplayService,
    private _modalService: ModalService,
    private _planListStoreService: PlanListStoreService
  ) {
    super(_common);
  }

  selectRadio: boolean = true;
  planName: string = '';
  cartId: string = '';
  selectPlan: PlansGetPlansResponsePlansInner = {};

  init(): void {
    this.planName = this.payload.selectPlan.planName ?? '';
    this.cartId = this.payload.selectPlan.cartId ?? '';
  }
  reload(): void {}
  destroy(): void {}

  /** プラン名変更押下処理 */
  clickRename() {
    // プラン名変更モーダル表示
    const part = planSaveModalParts();
    part.payload = {
      planName: this.planName,
      cartId: this.cartId,
    };
    this._modalService.showSubModal(part).then(() => {
      const isNeedInit = this._planListStoreService.PlanListData.isReInit;
      if (isNeedInit) {
        this.close();
      }
    });
  }

  /** プラン削除押下時処理 */
  clickDelete() {
    this.subscribeService(
      'PlanOperationModalComponent Dialog buttonClickObservable',
      this._dialogSvc.openDialog({ message: 'm_dynamic_message-MSG1039' }).buttonClick$,
      (result) => {
        this.deleteSubscription('PlanOperationModalComponent Dialog buttonClickObservable');
        if (result.clickType === DialogClickType.CONFIRM) {
          const loginStatus = this._common.aswContextStoreService.aswContextData.loginStatus;
          if (loginStatus === LoginStatusType.REAL_LOGIN) {
            // ログイン状態の場合

            const cartIds: Array<string> = [this.cartId];
            const param: PlansDeletePlansRequest = {
              cartIds: cartIds,
            };
            // プラン削除API実行
            this._planListService.deletePlans(param, () => this.afterDelete());
          } else if (loginStatus === LoginStatusType.NOT_LOGIN) {
            //　未ログインの場合

            const localPlanList = this._localPlanService.getLocalPlans();
            if (localPlanList) {
              const index: number | undefined = localPlanList?.plans?.findIndex((e) => e.cartId === this.cartId);
              // カートIDが一致するプランをローカルプランリストから削除
              if (typeof index !== 'undefined' && index >= 0) {
                localPlanList?.plans?.splice(index, 1);
              }
              this._localPlanService.setLocalPlans(localPlanList);
              this.afterDelete();
            }
          }
        }
      }
    );
  }

  /** プラン削除後処理 */
  afterDelete() {
    this._planListStoreService.afterDeletePlanList = this._planListStoreService.PlanListData.planList?.filter(
      (plan) => plan.cartId !== this.cartId
    );
    this.close();
  }

  /** 閉じるボタン押下時処理 */
  clickClose() {
    this.close();
  }
}
