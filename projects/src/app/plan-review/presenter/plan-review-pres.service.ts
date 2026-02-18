import { Injectable } from '@angular/core';
import { fixedArrayCache, getApplyDateCache, getApplyListData } from '@common/helper';
import { PlanReviewStoreService } from '@common/services';
import { SupportClass } from '@lib/components/support-class';
import { AswMasterService, CommonLibService, SystemDateService } from '@lib/services';
import { Observable, Subject } from 'rxjs';
import { first, scan } from 'rxjs/operators';
import { Traveler } from 'src/sdk-reservation';
import {
  getPlanReviewPresMasterKey,
  PlanReviewPresMasterData,
  PlanReviewWaitedComponentId,
} from './plan-review-pres.component.state';

/**
 * プラン確認画面 Contコンポーネント用サービス
 */
@Injectable({
  providedIn: 'root',
})
export class PlanReviewPresService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _aswMasterService: AswMasterService,
    private _sysDateService: SystemDateService,
    private _planReviewStoreService: PlanReviewStoreService
  ) {
    super();
  }

  /**
   * キャッシュ取得処理
   * @returns
   */
  getMasterData$(): Observable<PlanReviewPresMasterData> {
    const lang = this._common.aswContextStoreService.aswContextData.lang;
    const currentDate = this._sysDateService.getSystemDate();
    return new Observable<PlanReviewPresMasterData>((observer) => {
      this.subscribeService(
        'PlanReviewPresService getMasterDataAll',
        this._aswMasterService.load(getPlanReviewPresMasterKey(lang), true),
        (data) => {
          this.deleteSubscription('PlanReviewTripPresService getMasterDataAll');
          const masterData: PlanReviewPresMasterData = {
            airport: data[0],
            airline: data[1],
            equipmentPk: data[2],
            serviceDescription: data[3],
            listDataAll: getApplyListData(data[4] ?? [], currentDate),
            mileage: getApplyDateCache(data[5] ?? [], currentDate),
            specialMeal: fixedArrayCache(data[6]),
            preorderMeal: fixedArrayCache(data[7]),
            ffPriorityCode: data[8],
            langCodeConvert: data[9],
          };
          observer.next(masterData);
        }
      );
    });
  }

  /**
   * コンポーネント初期表示処理完了を待つ処理
   * @param notifier
   * @param waitlist
   * @param afterEvent
   */
  waitTillAllReadyToShow(
    notifier: Subject<PlanReviewWaitedComponentId>,
    waitlist: Array<PlanReviewWaitedComponentId>,
    afterEvent: () => void
  ): void {
    this.subscribeService(
      'PlanReviewPresService PlanReviewWaitedComponentId$',
      notifier.asObservable().pipe(
        scan((acc, componentId) => {
          acc.delete(componentId);
          return acc;
        }, new Set(waitlist)),
        first((idSet) => idSet.size === 0)
      ),
      () => {
        this.deleteSubscription('PlanReviewPresService PlanReviewWaitedComponentId$');
        afterEvent();
      }
    );
  }

  /**
   * isPlanChangedフラグをリセットする処理
   * @param afterEvent
   * @returns
   */
  resetIsPlanChanged(afterEvent?: (wasplanChanged: boolean) => void): void {
    this.subscribeService(
      'PlanReviewPresService ResetIsPlanChanged',
      this._planReviewStoreService.getPlanReview$().pipe(first((store) => !store.isPending)),
      (data) => {
        this.deleteSubscription('PlanReviewPresService ResetIsPlanChanged');
        // 差分強調表示判定をfalseに戻す
        this._planReviewStoreService.updatePlanReview({ isPlanChanged: false });
        // 後続処理が存在する場合、リセット前のisPlanChangedの値を渡して実行
        if (afterEvent) {
          afterEvent(!!data.isPlanChanged);
        }
      }
    );
  }

  /**
   * すべての搭乗者について、姓名が入力されているか
   * @param travelers 搭乗者情報の配列
   * @returns 搭乗者情報が1件以上かつ全員姓名入力済みの場合、true
   */
  isAllPaxInfoRegistered(travelers: Array<Traveler>): boolean {
    return (
      (travelers?.length ?? 0) > 0 &&
      travelers?.every((traveler) => traveler.names?.[0]?.firstName && traveler.names?.[0]?.lastName)
    );
  }

  destroy(): void {}
}
