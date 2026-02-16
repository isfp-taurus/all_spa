/**
 * 操作中プラン store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import {
  currentPlanInitialState,
  CurrentPlanModel,
  CurrentPlanState,
  CurrentPlanStore,
  resetCurrentPlan,
  selectCurrentPlanState,
  setCurrentPlan,
  updateCurrentPlan,
} from '@common/store/current-plan';
import { PlansGetPlansResponse } from 'src/sdk-reservation';

/**
 * 操作中プラン store サービス
 *
 * store情報
 * @param CurrentPlanData @see CurrentPlanState
 */
@Injectable()
export class CurrentPlanStoreService extends SupportClass {
  private _CurrentPlan$: Observable<CurrentPlanState>;
  private _CurrentPlanData!: CurrentPlanState;
  get CurrentPlanData() {
    return this._CurrentPlanData;
  }

  constructor(private _store: Store<CurrentPlanStore>) {
    super();
    this._CurrentPlan$ = this._store.pipe(
      select(selectCurrentPlanState),
      filter((data) => !!data)
    );
    this.subscribeService('CurrentPlanStoreService CurrentPlanObservable', this._CurrentPlan$, (data) => {
      this._CurrentPlanData = data;
    });
  }

  destroy() {}

  public setCurrentPlan(plan: CurrentPlanModel): void {
    this._store.dispatch(setCurrentPlan(plan));
  }

  /**
   * プランリストとカートIDから操作中プランを設定する処理
   * @param cartId
   * @param plansGetPlansResponse
   */
  public setCurrentPlanFromPlanList(
    cartId: string,
    plansGetPlansResponse: PlansGetPlansResponse | undefined,
    afterEvent?: () => void
  ): void {
    const newPlan = plansGetPlansResponse?.plans?.find((plan) => plan.cartId === cartId);

    // set後にafterEventを呼ぶ
    if (afterEvent) {
      this.subscribeService(
        'CurrentPlanStoreService CurrentPlan$',
        this.getCurrentPlan$().pipe(
          first((res) => {
            // 最新更新日時が同一か否か
            const isLatestLastModDate = res.planLastModificationDate == newPlan?.planLastModificationDate;
            // prebook時・解除時は最終更新日時が更新されないため、prebook有効期限を見る
            const isLatestPrebookExpiryDate = res.prebookExpiryDate == newPlan?.prebookExpiryDate;
            return isLatestLastModDate && isLatestPrebookExpiryDate;
          })
        ),
        () => {
          this.deleteSubscription('CurrentPlanStoreService CurrentPlan$');
          afterEvent();
        }
      );
    }
    this.setCurrentPlan(newPlan ?? currentPlanInitialState);
  }

  public updateCurrentPlan(plan: Partial<CurrentPlanModel>): void {
    this._store.dispatch(updateCurrentPlan(plan));
  }

  public getCurrentPlan$() {
    return this._CurrentPlan$;
  }

  public resetCurrentPlan() {
    this._store.dispatch(resetCurrentPlan());
  }
}
