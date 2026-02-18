import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { AncillarySvcType, PlanReviewOutputFBagInfo } from '@common/interfaces';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { PlanReviewServicePartsService } from '../plan-review-service-parts.service';
import { PageLoadingService } from '@lib/services/page-loading/page-loading.service';

@Component({
  selector: 'asw-plan-review-fbag',
  templateUrl: './plan-review-fbag.component.html',
  styleUrls: ['./plan-review-fbag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewFBagComponent extends SupportComponent {
  /** プラン有効判定 */
  @Input() isPlanValid = false;

  /** 画面出力用事前追加手荷物情報 */
  @Input()
  set data(value: PlanReviewOutputFBagInfo) {
    this._data = value;
    this.refresh();
  }
  get data(): PlanReviewOutputFBagInfo {
    return this._data;
  }
  private _data: PlanReviewOutputFBagInfo = {};

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
   * 事前追加手荷物申込モーダル表示処理
   */
  openBaggageRequest(): void {
    //PageInitService.endInitを使用しているため、endLoadingは入れない。
    this._loadingSvc.startLoading();
    this._servicePartsService.openServiceApplicationModal(AncillarySvcType.FBAG);
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
