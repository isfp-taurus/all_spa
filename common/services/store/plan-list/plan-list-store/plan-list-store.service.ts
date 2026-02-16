/**
 * プランリスト画面 store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {
  planListInitialState,
  PlanListModel,
  PlanListState,
  PlanListStore,
  selectPlanListState,
  setPlanList,
  updatePlanList,
} from '@common/store/plan-list';
import { PlanListCurrentPlan } from '@common/interfaces';

/**
 * store情報
 * @param PlanListData @see PlanListState
 */
@Injectable()
export class PlanListStoreService extends SupportClass {
  private _PlanList$: Observable<PlanListState>;
  private _PlanListData: PlanListState = planListInitialState;
  // プラン削除後処理用パラメーター
  public afterDeletePlanList?: Array<PlanListCurrentPlan>;

  get PlanListData() {
    return this._PlanListData;
  }

  constructor(private _store: Store<PlanListStore>) {
    super();
    this._PlanList$ = this._store.pipe(
      select(selectPlanListState),
      filter((data) => !!data)
    );
    this.subscribeService('PlanListStoreService PlanListObservable', this._PlanList$, (state) => {
      this._PlanListData = state;
    });
  }

  destroy() {}

  public getPlanList$() {
    return this._PlanList$;
  }

  public setPlanList(plan: PlanListModel): void {
    this._store.dispatch(setPlanList(plan));
  }

  public updatePlanList(plan: PlanListModel): void {
    this._store.dispatch(updatePlanList(plan));
  }
}
