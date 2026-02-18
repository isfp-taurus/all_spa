import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { AncillarySvcType, PlanReviewOutputMealInfo, MealApplicationState } from '@common/interfaces';
import { PlanReviewServicePartsService } from '../plan-review-service-parts.service';
import { PageLoadingService } from '@lib/services/page-loading/page-loading.service';

@Component({
  selector: 'asw-plan-review-meal',
  templateUrl: './plan-review-meal.component.html',
  styleUrls: ['./plan-review-meal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewMealComponent extends SupportComponent {
  /** プラン有効判定 */
  @Input() isPlanValid = false;

  /** 画面出力用機内食情報 */
  @Input()
  set data(value: PlanReviewOutputMealInfo) {
    this._data = value;
    this.refresh();
  }
  get data(): PlanReviewOutputMealInfo {
    return this._data;
  }
  private _data: PlanReviewOutputMealInfo = {};

  /** 機内食申込状況 */
  @Input() mealApplicationState: MealApplicationState = {};

  /** 通貨コード */
  @Input() currencyCode: string | undefined;

  /** スクロール可否判定 */
  public isScroll = false;

  constructor(
    private _common: CommonLibService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _servicePartsService: PlanReviewServicePartsService,
    private _loadingSvc: PageLoadingService
  ) {
    super(_common);
  }

  init(): void {}

  refresh() {
    this._changeDetectorRef.markForCheck();
  }

  reload(): void {}

  destroy(): void {}

  /**
   * 機内食申込モーダル表示処理
   */
  openFlightMealRequest(): void {
    //PageInitService.endInitを使用しているため、endLoadingは入れない。
    this._loadingSvc.startLoading();
    this._servicePartsService.openServiceApplicationModal(AncillarySvcType.MEAL);
  }

  /**
   * スクロール有無設定処理
   * ※asw-table-sliderから受け取った値を設定するために使用
   * @param value
   */
  setIsScroll(value: boolean) {
    this.isScroll = value;
  }
}
