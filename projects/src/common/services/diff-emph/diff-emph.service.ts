import { Injectable } from '@angular/core';
import { isEmptyObject } from '@common/helper';
import { Emphed, EmphType } from '@common/interfaces';
import { SupportClass } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { CurrentCartStoreService } from '../store/common/current-cart-store/current-cart-store.service';
import { PlanReviewStoreService } from '../store/plan-review/plan-review-store/plan-review-store.service';

/**
 * 差分強調表示用データ比較サービス
 */
@Injectable({
  providedIn: 'root',
})
export class DiffEmphService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _planReviewStoreService: PlanReviewStoreService
  ) {
    super();
  }

  /**
   * 差分強調表示用構造体作成処理
   * @param {T} current 最新情報
   * @param {T} prev 最新化前の情報
   * @returns {Emphed<T>} 出力値と差分強調表示種別
   */
  getEmphData<T>(current: T, prev: T): Emphed<T> {
    const currentCart = this._currentCartStoreService.CurrentCartData;
    const isPlanValid = !isEmptyObject(currentCart.data?.plan ?? {});
    const isPrevPlanExists = !isEmptyObject(currentCart.data?.previousPlan ?? {});
    // 他項目で差分強調表示が既に行われているか
    const isSomethingAlreadyEmphed = this._planReviewStoreService.PlanReviewData.isPlanChanged;

    if (!isPlanValid) {
      // プラン無効の場合
      return { value: prev, type: EmphType.NL };
    }
    if (!isPrevPlanExists) {
      // プラン有効かつpreviousPlanがまるごと存在しない場合
      return { value: current, type: EmphType.NL };
    }
    if (!current && prev) {
      // 新情報が存在しない場合
      if (!isSomethingAlreadyEmphed) {
        this._planReviewStoreService.updatePlanReview({ isPlanChanged: true });
      }
      return { value: prev, type: EmphType.DEL };
    }
    if (current !== prev) {
      // 新旧情報に差異がある場合
      if (!isSomethingAlreadyEmphed) {
        this._planReviewStoreService.updatePlanReview({ isPlanChanged: true });
      }
      return { value: current, type: EmphType.DIFF };
    }
    // 差分なしの場合
    return { value: current, type: EmphType.NL };
  }

  destroy(): void {}
}
