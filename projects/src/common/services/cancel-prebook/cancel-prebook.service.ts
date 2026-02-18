import { Injectable } from '@angular/core';
import { apiEventAll } from '@common/helper';
import { SupportClass } from '@lib/components/support-class';
import { ErrorType } from '@lib/interfaces';
import { CommonLibService, ErrorsHandlerService, PageLoadingService } from '@lib/services';
import { OrdersDeletePrebookedOrderRequest } from 'src/sdk-reservation';
import { DeletePrebookedOrderStoreService } from '../api-store/sdk-reservation/delete-prebooked-order-store/delete-prebooked-order-store.service';
import { LocalPlanService } from '../local-plan/local-plan.service';
import { CurrentCartStoreService } from '../store/common/current-cart-store/current-cart-store.service';
import { CurrentPlanStoreService } from '../store/common/current-plan-store/current-plan-store.service';
import { ErrorCodeConstants } from '@conf/app.constants';

@Injectable({
  providedIn: 'root',
})
export class CancelPrebookService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _errorsHandlerSvc: ErrorsHandlerService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _currentPlanStoreService: CurrentPlanStoreService,
    private _deletePrebookedOrderStoreService: DeletePrebookedOrderStoreService,
    private _localPlanService: LocalPlanService,
    private _pageLoadingService: PageLoadingService
  ) {
    super();
  }

  destroy(): void {}

  /**
   * Prebook解除処理
   * @param notLoading ローディング処理を入れないフラグ
   * @returns Promise<boolean> 成功true 失敗false
   */
  cancelPrebook(notLoading?: boolean): Promise<boolean> {
    return new Promise((resolve) => {
      this.cancelPrebookNext(
        () => {
          resolve(true);
        },
        () => {
          resolve(false);
        },
        notLoading
      );
    });
  }

  /**
   * Prebook解除処理 observableタイプ
   * @param success 成功時処理
   * @param error 失敗時処理
   * @param notLoading ローディング処理を入れないフラグ
   */
  cancelPrebookNext(success: () => void, error?: (isNotRetryable: boolean) => void, notLoading?: boolean): void {
    if (!notLoading) {
      this._pageLoadingService.startLoading();
    }
    // Prebook削除APIを実行
    const requestParams: OrdersDeletePrebookedOrderRequest = {
      cartId: this._currentCartStoreService.CurrentCartData.data?.cartId ?? '',
    };
    apiEventAll(
      () => this._deletePrebookedOrderStoreService.setDeletePrebookedOrderFromApi(requestParams),
      this._deletePrebookedOrderStoreService.getDeletePrebookedOrder$(),
      (response) => {
        if (!notLoading) {
          this._pageLoadingService.endLoading();
        }
        const currentCart = this._currentCartStoreService.CurrentCartData;
        const currentPlan = this._currentPlanStoreService.CurrentPlanData;
        const updatedPlan = {
          ...currentPlan,
          isPrebooked: false,
          prebookExpiryDate: '',
        };

        if (currentPlan.cartId) {
          // 操作中プラン情報の更新
          this._currentPlanStoreService.setCurrentPlan(updatedPlan);
        }
        if (this._common.isNotLogin()) {
          // 未ログイン状態の場合、ローカルプランリストの更新を行う
          const localPlanList = this._localPlanService.getLocalPlans();
          const index = localPlanList?.plans?.findIndex((plan) => plan.cartId === currentCart.data?.cartId) ?? -1;
          if (localPlanList?.plans && index !== -1) {
            // 操作中プランがローカルプランリストに存在する場合
            if (localPlanList.plans[index]?.isUnsaved) {
              // 未保存の場合、当該プランを削除
              localPlanList.plans.splice(index, 1);
            } else {
              // 保存済みの場合、ローカルプランを操作中プランで上書き
              localPlanList.plans[index] = updatedPlan;
            }
            this._localPlanService.setLocalPlans(localPlanList);
          }
        }
        success();
      },
      (err) => {
        if (!notLoading) {
          this._pageLoadingService.endLoading();
        }
        const apiErr = this._common.apiError?.errors?.[0]?.code ?? '';
        if (apiErr === ErrorCodeConstants.ERROR_CODES.EBAZ000278) {
          this._errorsHandlerSvc.setNotRetryableError({
            errorType: ErrorType.BUSINESS_LOGIC,
            errorMsgId: 'E0333',
            apiErrorCode: apiErr,
          });
        }
        if (error) {
          error(apiErr === ErrorCodeConstants.ERROR_CODES.EBAZ000278);
        }
      }
    );
  }
}
