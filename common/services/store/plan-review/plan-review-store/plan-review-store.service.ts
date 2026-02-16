/**
 * プラン確認画面 store サービス
 *
 */
import { Injectable } from '@angular/core';
import { SupportClass } from '@lib/components/support-class';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs/internal/Observable';
import { filter } from 'rxjs/operators';
import {
  PlanReviewModel,
  PlanReviewState,
  PlanReviewStore,
  resetPlanReview,
  selectPlanReviewState,
  setPlanReview,
  updatePlanReview,
} from '@common/store/plan-review';

/**
 * プラン確認画面 store サービス
 *
 * store情報
 * @param PlanReviewData @see PlanReviewState
 */
@Injectable()
export class PlanReviewStoreService extends SupportClass {
  private _PlanReview$: Observable<PlanReviewState>;
  private _PlanReviewData!: PlanReviewState;
  get PlanReviewData() {
    return this._PlanReviewData;
  }

  constructor(private _store: Store<PlanReviewStore>) {
    super();
    this._PlanReview$ = this._store.pipe(
      select(selectPlanReviewState),
      filter((data) => !!data)
    );
    this.subscribeService('PlanReviewStoreService PlanReviewObservable', this._PlanReview$, (data) => {
      this._PlanReviewData = data;
    });
  }

  destroy() {}

  public setPlanReview(data: PlanReviewModel): void {
    this._store.dispatch(setPlanReview(data));
  }

  public getPlanReview$() {
    return this._PlanReview$;
  }

  public resetPlanReview(): void {
    this._store.dispatch(resetPlanReview());
  }

  updatePlanReview(prop: Partial<PlanReviewModel>): void {
    this._store.dispatch(updatePlanReview(prop));
  }
}
