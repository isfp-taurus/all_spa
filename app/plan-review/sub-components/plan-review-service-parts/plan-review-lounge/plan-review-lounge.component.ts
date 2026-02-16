import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { AncillarySvcType, PlanReviewOutputLoungeInfo } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { PlanReviewServicePartsService } from '../plan-review-service-parts.service';
import { PageLoadingService } from '@lib/services/page-loading/page-loading.service';

@Component({
  selector: 'asw-plan-review-lounge',
  templateUrl: './plan-review-lounge.component.html',
  styleUrls: ['./plan-review-lounge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PlanReviewLoungeComponent extends SupportComponent {
  /** プラン有効判定 */
  @Input() isPlanValid = false;

  /** 画面出力用ラウンジ情報 */
  @Input()
  set data(value: PlanReviewOutputLoungeInfo) {
    this._data = value;
    this.refresh();
  }
  get data(): PlanReviewOutputLoungeInfo {
    return this._data;
  }
  private _data: PlanReviewOutputLoungeInfo = {};

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
   * ラウンジ申込モーダル表示処理
   */
  openLoungeServiceRequest(): void {
    //PageInitService.endInitを使用しているため、endLoadingは入れない。
    this._loadingSvc.startLoading();
    this._servicePartsService.openServiceApplicationModal(AncillarySvcType.LOUG);
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
