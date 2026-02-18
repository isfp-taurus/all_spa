import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { isEmptyObject } from '@common/helper';
import { EmphType } from '@common/interfaces';
import {
  CurrentCartStoreService,
  PlanReviewStoreService,
  DiffEmphService,
  OrdersReservationAvailabilityStoreService,
} from '@common/services';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService, ModalService } from '@lib/services';
import { first } from 'rxjs/operators';
import { CreateCartResponseDataPlanPrices } from 'src/sdk-reservation';
import { PaymentDetailsSummaryAmountType } from '../modal/plan-review-payment-details/payment-details-summary/payment-details-summary.state';
import {
  paymentDetailsModalParts,
  PaymentDetailsPayload,
} from '../modal/plan-review-payment-details/plan-review-payment-details.state';
import { AppConstants } from '@conf/app.constants';

/**
 * 支払情報サマリ
 */
@Component({
  selector: 'asw-payment-summary',
  templateUrl: './plan-review-payment-summary.component.html',
  styleUrls: ['./plan-review-payment-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanReviewPaymentSummaryComponent extends SupportComponent {
  public appConstants = AppConstants;
  constructor(
    private _common: CommonLibService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _modalService: ModalService,
    private _diffEmphService: DiffEmphService,
    private _planReviewStoreService: PlanReviewStoreService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _ordersReservationAvailabilityStoreService: OrdersReservationAvailabilityStoreService
  ) {
    super(_common);
  }

  /** 初期表示準備完了EventEmitter */
  @Output() readyToShow = new EventEmitter();

  /**
   * 操作中カートの最新支払情報
   */
  public currentPrices?: CreateCartResponseDataPlanPrices = {};

  /**
   * 最新化前の支払情報
   */
  public previousPrices?: CreateCartResponseDataPlanPrices = {};

  /** 支払情報 */
  public total: {
    value?: number;
    type?: EmphType;
  } = {};

  /** プラン有効判定 */
  public isPlanValid = false;

  /** 初期表示準備完了フラグ */
  public isShow = false;

  /** 出力する支払情報 */
  public outputPrices: CreateCartResponseDataPlanPrices = {};

  /** カナダサイトフラグ */
  public isCA = false;

  /** プロモーション適用フラグ */
  public isPromoApplied = false;

  /** プロモーション名 */
  public promoName = '';

  /** 通貨コード */
  public currencyCode = '';

  /** 特典予約フラグ */
  @Input() isAwardBooking?: boolean = false;

  /** 必要マイル総数 */
  public sumRequiredMiles?: number;

  /** 旅客毎必要マイル数 */
  public paxRequiredMiles?: number;

  /**
   * 初期表示処理
   */
  init(): void {
    // 必要マイル数取得
    this._ordersReservationAvailabilityStoreService.isDataReady$().subscribe((isReady) => {
      if (isReady) {
        this.sumRequiredMiles =
          this._ordersReservationAvailabilityStoreService.ordersReservationAvailabilityData.model?.data?.requiredMilesInfo?.pnr?.sumRequiredMiles;
        this.paxRequiredMiles =
          this._ordersReservationAvailabilityStoreService.ordersReservationAvailabilityData.model?.data?.requiredMilesInfo?.pax?.sumRequiredMiles;
        this._changeDetectorRef.markForCheck();
      }
    });
    this.subscribeService(
      'PlanReviewPaymentSummary isRightOffice',
      this._planReviewStoreService.getPlanReview$().pipe(first((store) => !!store.isRightOffice)),
      () => {
        this.deleteSubscription('PlanReviewPaymentSummary isRightOffice');
        this.refresh();
      }
    );
  }

  refresh(): void {
    this.subscribeService(
      'PlanReviewPaymentSummary CurrentCart$',
      this._currentCartStoreService.getCurrentCart$().pipe(first((store) => !store.isPending)),
      (data) => {
        this.deleteSubscription('PlanReviewPaymentSummary CurrentCart$');
        this.isPlanValid = !isEmptyObject(data.data?.plan ?? {});
        const currentPrices = data.data?.plan?.prices ?? {};
        const previousPrices = data.data?.previousPlan?.prices ?? {};

        this.isCA = this._common.aswContextStoreService.aswContextData.posCountryCode === 'CA';

        // プランの有効無効に応じ、表示する支払情報を選定
        this.outputPrices = this.isPlanValid ? currentPrices : previousPrices;

        // 支払通貨
        this.currencyCode = this.outputPrices.totalPrices?.total?.currencyCode ?? '';

        // プロモーション適用状況を判定
        this.isPromoApplied = false;
        this.promoName = '';

        // 支払総額の差分強調表示
        const currentTotal = currentPrices.totalPrices?.total?.value;
        const prevTotal = previousPrices.totalPrices?.total?.value;
        this.total = this._diffEmphService.getEmphData(currentTotal, prevTotal);

        this.isShow = true;
        this.readyToShow.emit();
        this._changeDetectorRef.markForCheck();
      }
    );
  }

  reload(): void {}

  destroy(): void {}

  /**
   * 支払情報詳細モーダル表示処理
   */
  showPaymentDetails(): void {
    const parts = paymentDetailsModalParts();

    // 支払総額の差分強調表示設定
    let amountType: PaymentDetailsSummaryAmountType;
    switch (this.total.type) {
      case 'del':
        amountType = PaymentDetailsSummaryAmountType.DEL;
        break;
      case 'diff':
        amountType = PaymentDetailsSummaryAmountType.DIFF;
        break;
      default:
        amountType = PaymentDetailsSummaryAmountType.NONE;
        break;
    }

    const payload: PaymentDetailsPayload = {
      amountType: amountType,
      totalMileage: this.sumRequiredMiles ?? 0,
      paxMileage: this.paxRequiredMiles ?? 0,
      isAwardBooking: this.isAwardBooking,
    };
    parts.payload = payload;
    this._modalService.showSubModal(parts);
  }
}
