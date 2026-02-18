import { Injectable } from '@angular/core';
import {
  BaggageApplicationModalPayload,
  baggageApplicationModalPayloadParts,
  LoungeApplicationModalPayload,
  loungeApplicationModalPayloadParts,
  MealApplicationModalPayload,
  mealApplicationModalPayloadParts,
} from '@app/id-modal/service-application';
import { isStringEmpty } from '@common/helper';
import {
  RamlServicesBaggageFirst,
  RamlServicesLounge,
  RamlServicesMeal,
  RamlServicesMealPassenger,
  RamlServicesBaggageFirstSegmentMain,
  RamlServicesLoungeIdInfoMain,
  AncillarySvcType,
} from '@common/interfaces';
import { PlanReviewStoreService } from '@common/services';
import { SupportClass } from '@lib/components/support-class';
import { StaticMsgPipe } from '@lib/pipes';
import { CommonLibService, ModalService } from '@lib/services';
import { RegisteredPetsPerSegment } from 'src/sdk-reservation';

/**
 * サービスパーツ用サービス
 */
@Injectable({
  providedIn: 'root',
})
export class PlanReviewServicePartsService extends SupportClass {
  constructor(
    private _common: CommonLibService,
    private _staticMsgPipe: StaticMsgPipe,
    private _modalService: ModalService,
    private _planReviewStoreService: PlanReviewStoreService
  ) {
    super();
  }

  /**
   * サービス申込モーダル表示処理
   * @param type
   */
  openServiceApplicationModal(
    type: AncillarySvcType,
    payload?: BaggageApplicationModalPayload | LoungeApplicationModalPayload | MealApplicationModalPayload
  ): void {
    // モーダル閉じ時処理(共通)
    const commonCloseEvent = (isUpdate?: boolean) => {
      if (isUpdate) {
        this.refreshPlan();
      }
    };

    switch (type) {
      case AncillarySvcType.FBAG:
        const fBagParts = baggageApplicationModalPayloadParts();
        fBagParts.payload = payload;
        fBagParts.closeEvent = commonCloseEvent;
        this._modalService.showSubPageModal(fBagParts);
        break;
      case AncillarySvcType.LOUG:
        const loungeParts = loungeApplicationModalPayloadParts();
        loungeParts.payload = payload;
        loungeParts.closeEvent = commonCloseEvent;
        this._modalService.showSubPageModal(loungeParts);
        break;
      case AncillarySvcType.MEAL:
        const mealParts = mealApplicationModalPayloadParts();
        mealParts.payload = payload;
        mealParts.closeEvent = commonCloseEvent;
        this._modalService.showSubPageModal(mealParts);
        break;
      default:
        break;
    }
  }

  /**
   * プラン確認画面更新処理を呼ぶ
   */
  refreshPlan(): void {
    this._planReviewStoreService.updatePlanReview({ isNeedRefresh: true });
  }

  /**
   * ラウンジ名称取得処理
   * @param code SSRコード
   * @returns ラウンジ名称
   */
  getLoungeName(code: string): string {
    switch (code) {
      case 'LOUG':
        return this._staticMsgPipe.transform('label.loungeName.ssrLoug2');
      case 'MYLG':
        return this._staticMsgPipe.transform('label.loungeName.ssrMylg');
      default:
        return '';
    }
  }

  /**
   * 事前追加手荷物最安値算出処理
   * @param fBagInfo
   * @returns number
   */
  getFBagMin(fBagInfo: RamlServicesBaggageFirst): number | undefined {
    const priceList: number[] = [];
    const boundList = Object.values(fBagInfo);
    boundList.forEach((bound) => {
      const paxList = Object.values(bound).filter(this.isNotBool<RamlServicesBaggageFirstSegmentMain>);
      paxList.forEach((pax) => {
        if (pax.catalogue?.prices?.total) {
          priceList.push(pax.catalogue?.prices?.total);
        }
      });
    });
    return priceList.length ? priceList.reduce((min, price) => (min < price ? min : price)) : undefined;
  }

  /**
   * ラウンジ最安値算出処理
   * @param loungeInfo
   * @returns number
   */
  getLoungeMin(loungeInfo: RamlServicesLounge): number | undefined {
    const priceList: Array<number> = [];
    const segList = Object.values(loungeInfo);
    segList.forEach((segment) => {
      const paxList = Object.values(segment).filter(this.isNotBool<RamlServicesLoungeIdInfoMain>);
      paxList.forEach((pax) => {
        if (pax.catalogue?.some((catalogue) => !!catalogue.prices?.total)) {
          const segPaxCatalogueMin = pax.catalogue
            .map((catalogue) => catalogue.prices?.total)
            .filter((value) => !!value)
            .reduce((min, price) => (min < price ? min : price));
          priceList.push(segPaxCatalogueMin);
        }
      });
    });
    return priceList.length ? priceList.reduce((min, price) => (min < price ? min : price)) : undefined;
  }

  /**
   * 型の絞り込み用
   * @param value
   */
  isNotBool<T>(value: boolean | T): value is T {
    return !!value && typeof value !== 'boolean';
  }

  /**
   * 事前追加手荷物が申込可能なバウンドが1件でも存在するか
   * @param fBagInfo
   * @returns
   */
  isFBagAvailable(fBagInfo: RamlServicesBaggageFirst): boolean {
    return Object.values(fBagInfo).some((bound) => bound.isAvailable);
  }

  /**
   * ラウンジが申込可能なセグメントが1件でも存在するか
   * @param loungeInfo
   * @returns
   */
  isLoungeAvailable(loungeInfo: RamlServicesLounge): boolean {
    return Object.values(loungeInfo).some((segment) => segment.isAvailable);
  }

  /**
   * 機内食が申込可能なセグメントが1件でも存在するか
   * @param mealInfo
   * @returns
   */
  isMealAvailable(mealInfo: RamlServicesMeal): boolean {
    return Object.values(mealInfo).some((segment) => segment.isAvailable);
  }

  /**
   * 機内食が1件でも申し込まれているか
   * @param mealInfo
   * @returns
   */
  isAppliedAnyMeal(mealInfo: RamlServicesMeal): boolean {
    return Object.values(mealInfo).some((segment) =>
      Object.values(segment).some(
        (paxOrBool) =>
          this.isNotBool<RamlServicesMealPassenger>(paxOrBool) &&
          paxOrBool.appliedMealList.some((meal) => !isStringEmpty(meal.code))
      )
    );
  }

  /**
   * ペットらくのりが1件でも申し込まれているか
   * @param petInfo
   * @returns
   */
  isAppliedAnyPet(petInfo: RegisteredPetsPerSegment): boolean {
    return Object.values(petInfo).some((segment) =>
      Object.values(segment).some((traveler) => traveler.some((pet) => !isStringEmpty(pet.id)))
    );
  }

  destroy(): void {}
}
