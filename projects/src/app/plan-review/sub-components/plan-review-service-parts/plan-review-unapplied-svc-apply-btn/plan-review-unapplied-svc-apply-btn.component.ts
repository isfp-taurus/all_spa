import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AncillarySvcType } from '@common/interfaces/reservation/plan-review/ancillary-service.type';
import { RoutesResRoutes } from '@conf/routes.config';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { PlanReviewServicePartsService } from '../plan-review-service-parts.service';
import { PageLoadingService } from '@lib/services/page-loading/page-loading.service';

/**
 * サービス未申込かつ申込可能時の表示
 */
@Component({
  selector: 'asw-unapplied-svc-apply-btn',
  templateUrl: './plan-review-unapplied-svc-apply-btn.component.html',
  styleUrls: ['./plan-review-unapplied-svc-apply-btn.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewUnappliedSvcApplyBtnComponent extends SupportComponent {
  /** プラン有効判定 */
  @Input() isPlanValid = false;

  /** サービス種別 */
  @Input() serviceType: AncillarySvcType = AncillarySvcType.FBAG;

  /** 最安金額 */
  @Input() minPrice?: number;

  /** 通貨コード */
  @Input() currencyCode: string | undefined;

  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _servicePartsService: PlanReviewServicePartsService,
    private _pageLoadingService: PageLoadingService
  ) {
    super(_common);
  }

  init(): void {}
  reload(): void {}
  destroy(): void {}

  /**
   * サービス申込モーダル表示処理
   */
  clickApplyBtn(): void {
    this._pageLoadingService.startLoading();
    if (this.serviceType === AncillarySvcType.PET) {
      // ペットらくのりの場合、画面遷移
      this._router.navigateByUrl(RoutesResRoutes.PET_RESERVATION_INFORMATION_REQUEST);
    } else {
      // サービス申込モーダルを開く
      this._servicePartsService.openServiceApplicationModal(this.serviceType);
    }
  }
}
