import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PlanReviewOutputPetInfo } from '@common/interfaces';
import { RoutesResRoutes } from '@conf/routes.config';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { PageLoadingService } from '@lib/services/page-loading/page-loading.service';

@Component({
  selector: 'asw-plan-review-pet',
  templateUrl: './plan-review-pet.component.html',
  styleUrls: ['./plan-review-pet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PlanReviewPetComponent extends SupportComponent {
  /** プラン有効判定 */
  @Input() isPlanValid = false;

  /** 画面出力用ペットらくのり情報 */
  @Input()
  set data(value: PlanReviewOutputPetInfo) {
    this._data = value;
    this.refresh();
  }
  get data(): PlanReviewOutputPetInfo {
    return this._data;
  }
  private _data: PlanReviewOutputPetInfo = {};

  /** スクロール可否判定 */
  public isScroll = false;

  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _pageLoadingService: PageLoadingService
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
   * ペットらくのり申込画面遷移処理
   */
  goToPetReservation(): void {
    this._pageLoadingService.startLoading();
    this._router.navigateByUrl(RoutesResRoutes.PET_RESERVATION_INFORMATION_REQUEST);
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
