import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { GetCartStoreService, PlanReviewStoreService } from '@common/services';
import { SupportModalIdSubComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';

/**
 * 搭乗者情報入力画面　ヘッダー
 */
@Component({
  selector: 'asw-passenger-information-request-header',
  templateUrl: './passenger-information-request-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PassengerInformationRequestHeaderComponent extends SupportModalIdSubComponent {
  reload() {}
  init() {}
  destroy() {}

  public isUpdateTraveler: boolean = false;

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _common: CommonLibService,
    private _getCartStoreService: GetCartStoreService,
    private _planReviewStoreService: PlanReviewStoreService
  ) {
    super(_common);
  }

  /** モーダルクローズ処理 */
  public clickCloseModal() {
    if (!this.payload?.isEditMode && this.isUpdateTraveler) {
      // 画面情報更新判定をtrueにする
      this._planReviewStoreService.updatePlanReview({ isNeedRefresh: true });
    }
    this._getCartStoreService.resetGetCart();
    this.close();
  }
}
