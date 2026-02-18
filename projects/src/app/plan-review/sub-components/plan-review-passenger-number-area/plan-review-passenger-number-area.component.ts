import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { isEmptyObject } from '@common/helper';
import { CurrentCartStoreService, DcsDateService, PlanReviewStoreService } from '@common/services';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService, ModalService } from '@lib/services';
import { first } from 'rxjs/operators';
import { addPassengerModalParts } from '../modal/plan-review-add-passenger-modal/plan-review-add-passenger-modal.state';

/**
 * 搭乗者人数エリア
 */
@Component({
  selector: 'asw-passenger-number-area',
  templateUrl: './plan-review-passenger-number-area.component.html',
  styleUrls: ['./plan-review-passenger-number-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewPassengerNumberAreaComponent extends SupportComponent {
  constructor(
    private _common: CommonLibService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _modalService: ModalService,
    private _planReviewStoreService: PlanReviewStoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _dcsDateService: DcsDateService
  ) {
    super(_common);
  }

  /** 搭乗者種別毎の人数 */
  public numPerPtc = {
    ADT: 0,
    B15: 0,
    CHD: 0,
    INF: 0,
  };

  /** プラン有効判定 */
  public isPlanValid = false;

  /**
   * 初期表示処理
   */
  init(): void {
    this.subscribeService(
      'PlanReviewPassengerNumberArea isRightOffice',
      this._planReviewStoreService.getPlanReview$().pipe(first((store) => !!store.isRightOffice)),
      () => {
        this.deleteSubscription('PlanReviewPassengerNumberArea isRightOffice');
        this.refresh();
      }
    );
  }

  refresh(): void {
    this.subscribeService(
      'PlanReviewPassengerNumberArea CurrentCart$',
      this._currentCartStoreService.getCurrentCart$().pipe(first((store) => !store.isPending)),
      (data) => {
        this.deleteSubscription('PlanReviewPassengerNumberArea CurrentCart$');
        this.isPlanValid = !isEmptyObject(data.data?.plan ?? {});

        const numOfTraveler = this.isPlanValid
          ? this._currentCartStoreService.CurrentCartData.data?.plan?.travelersSummary?.numberOfTraveler
          : this._currentCartStoreService.CurrentCartData.data?.previousPlan?.travelersSummary?.numberOfTraveler;

        this.numPerPtc.ADT = numOfTraveler?.ADT ?? 0;
        this.numPerPtc.B15 = numOfTraveler?.B15 ?? 0;
        this.numPerPtc.CHD = numOfTraveler?.CHD ?? 0;
        this.numPerPtc.INF = numOfTraveler?.INF ?? 0;

        this._changeDetectorRef.markForCheck();
      }
    );
  }

  reload(): void {}

  destroy(): void {}

  /**
   * 搭乗者人数変更モーダル表示処理
   */
  openAddPassengerModal(): void {
    // FY25: DCS移行開始日前後判定
    const departureDate =
      this._currentCartStoreService.CurrentCartData.data?.plan?.airOffer?.bounds?.[0]?.originDepartureDateTime ?? '';
    const isAfterDcs = this._dcsDateService.isAfterDcs(departureDate);
    const parts = addPassengerModalParts();
    parts.payload = { isAfterDcs: isAfterDcs };
    this._modalService.showSubModal(parts);
  }
}
