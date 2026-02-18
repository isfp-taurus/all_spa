import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { PaymentInputStoreService } from '@common/services';
import { RoutesResRoutes } from '@conf/routes.config';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import { CommonLibService } from '@lib/services';
import { GetOrderStoreService } from '@common/services/api-store/sdk-servicing/get-order-store/get-order-store.service';
import { CurrentCartStoreService } from '@common/services/store/common/current-cart-store/current-cart-store.service';
import {
  PaymentAmountData,
  initPaymentAmountData,
  PaymentAmountParts,
  initPaymentAmountParts,
} from './payment-input-payment-amount.state';
import { isPC, isSP, isTB } from '@lib/helpers';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { StaticMsgPipe } from '@lib/pipes';
import { GetOrderResponseData } from 'src/sdk-servicing';
import { OrdersReservationAvailabilityStoreService } from '@common/services';
import { PaymentDetailsData } from './payment-input-payment-amount.state';

/**
 * payment-input-payment-amount
 * 支払金額エリア
 */
@Component({
  selector: 'asw-payment-input-payment-amount',
  templateUrl: './payment-input-payment-amount.component.html',
  styleUrls: ['./payment-input-payment-amount.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputPaymentAmountComponent extends SubComponentModelComponent<
  PaymentAmountData,
  PaymentAmountParts
> {
  _data = initPaymentAmountData();
  _parts = initPaymentAmountParts();
  // 画面のサイズを切り替えの設定
  public isSp = isSP();
  public isTb = isTB();
  public isPc = isPC();
  private _isSpPre = isSP();
  private _isTbPre = isTB();
  private _isPcPre = isPC();

  setDataEvent() {
    this.refresh();
  }
  setPartsEvent() {
    this.appliedDiscountType = this.parts.appliedDiscountType;
    this.appliedAamDiscountCode = this.parts.appliedAamDiscountCode ?? '';
    this.refresh();
  }

  private resizeEvent = () => {
    this._isSpPre = this.isSp;
    this._isTbPre = this.isTb;
    this._isPcPre = this.isPc;
    this.isSp = isSP();
    this.isTb = isTB();
    this.isPc = isPC();
    if (this._isSpPre !== this.isSp || this._isTbPre !== this.isTb || this._isPcPre !== this.isPc) {
      this._changeDetectorRef.markForCheck();
    }
  };

  // 特典PNRフラグ
  public isAwardBooking: boolean = false;
  // 支払総額
  public totalPrice: number = 0;
  public totalPriceCurrency?: string;
  // お支払合計＝PFC税金
  public totalTax: number = 0;
  public totalTaxCurrency?: string;
  // 必要マイル総数
  public pnrSumRequiredMiles: number = 0;
  // 旅客毎必要マイル数
  public paxSumRequiredMiles: number = 0;
  // プロモーションコード適用前支払総額
  public totalPriceBeforeApplying: number = 0;
  // 適用済AAMプロモーションコード
  @Input() appliedAamDiscountCode: string = '';
  // プロモーションコード適用判定
  @Input() isApplicableDiscountCode: boolean = false;
  // プロモーション種別
  @Input() appliedDiscountType: string = '';
  // 支払情報詳細ボタン処理
  @Output() paymentDetails = new EventEmitter<PaymentDetailsData>();
  // AAMプロモーションコード入力のクリックイベント
  @Output() usePromotionCode = new EventEmitter<Event>();
  // AAMプロモーションコード適用解除のクリックイベント
  @Output() cancelPromotionCode = new EventEmitter<Event>();
  // Keep My Fare 選択識別子
  @Input() isKeepMyFare: boolean = true;
  // Kmf変更イベント用
  @Input()
  set changeKmf(changeKmf: boolean) {
    this.changeHeaderLabel(changeKmf);
  }
  // KMF合計金額
  public totalPriceOfKeepMyFare: number = 0;
  public KeepMyFareCurrencyCode: string = '';
  public isDisplayPlanReviewLink: boolean = false;
  // 支払金額エリアヘッダラベル
  public amountHeaderLabel: string = '';

  constructor(
    private _common: CommonLibService,
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _paymentInputStoreService: PaymentInputStoreService,
    private _getOrderService: GetOrderStoreService,
    private _currentCartStoreService: CurrentCartStoreService,
    private _staticMsgPipe: StaticMsgPipe,
    private _ordersReservationAvailabilityStoreService: OrdersReservationAvailabilityStoreService
  ) {
    super(_changeDetectorRef, _common);
  }

  /**
   * 支払情報詳細ボタン処理
   */
  clickPaymentDetails(event: Event) {
    // マイル情報を詳細画面に渡す
    if (this.isAwardBooking) {
      this.paymentDetails.emit({
        totalMileage: this.pnrSumRequiredMiles ?? 0,
        paxMileage: this.paxSumRequiredMiles ?? 0,
        isAwardBooking: this.isAwardBooking,
      });
    } else {
      this.paymentDetails.emit({
        totalMileage: 0,
        paxMileage: 0,
        isAwardBooking: false,
      });
    }
  }
  /**
   * AAMプロモーションコード入力のクリックイベント
   */
  clickUsePromotionCode() {
    this.usePromotionCode.emit();
  }
  /**
   * AAMプロモーションコード適用解除のクリックイベント
   */
  clickCancelPromotionCode() {
    this.cancelPromotionCode.emit();
  }

  /**
   * SubComponentModelComponent用情報流入時更新用関数
   */
  refresh() {
    this._changeDetectorRef.markForCheck();
  }

  update() {
    this.dataChange.emit(this._data);
  }

  reload(): void {}

  init(): void {
    //画面のサイズを切り替えの設定
    this.subscribeService(
      'paymentInputPres_subHeaderResize',
      fromEvent(window, 'resize').pipe(throttleTime(500)),
      this.resizeEvent
    );

    this.subscribeService(
      'paymentAmountAreaPnrInfoSubscription',
      this._getOrderService.getGetOrderObservable(),
      (value) => {
        // 支払総額取得
        const totalPrices = value.data?.prices?.totalPrices;
        this.totalPrice = totalPrices?.total?.[0]?.value ?? 0;
        this.totalPriceCurrency = totalPrices?.total?.[0]?.currencyCode;
        // お支払い合計(PFC税金取得)
        const ticketPrices = value.data?.prices?.totalPrices?.ticketPrices;
        this.totalTax = ticketPrices?.totalTaxes?.[0]?.value ?? 0;
        this.totalTaxCurrency = ticketPrices?.totalTaxes?.[0]?.currencyCode;
        // 特典フラグ取得
        const orderType = value.data?.orderType;
        this.isAwardBooking = Boolean(orderType?.isAwardBooking);
        this._changeDetectorRef.detectChanges();
      }
    );

    this.subscribeService(
      'paymentAmountAreaCartInfoSubscription',
      this._currentCartStoreService.getCurrentCart$(),
      (value) => {
        this.isDisplayPlanReviewLink = !!value.data?.cartId;
      }
    );

    this._ordersReservationAvailabilityStoreService.isDataReady$().subscribe((isReady) => {
      if (isReady) {
        // 必要マイル総数を取得
        this.pnrSumRequiredMiles =
          this._ordersReservationAvailabilityStoreService.ordersReservationAvailabilityData.model?.data
            ?.requiredMilesInfo?.pnr?.sumRequiredMiles ?? 0;
        // 旅客毎のマイル数取得
        this.paxSumRequiredMiles =
          this._ordersReservationAvailabilityStoreService.ordersReservationAvailabilityData.model?.data
            ?.requiredMilesInfo?.pax?.sumRequiredMiles ?? 0;

        this._changeDetectorRef.markForCheck();
      }
    });
    this._changeDetectorRef.markForCheck();
  }

  destroy(): void {
    this.deleteSubscription('paymentAmountAreaPnrInfoSubscription');
    this.deleteSubscription('paymentAmountAreaCartInfoSubscription');
  }

  clickPrevPlanInfo() {
    // 支払情報入力画面取得情報破棄処理
    this._paymentInputStoreService.paymentInputInformationDiscard();
    // プラン確認画面に戻る
    this._router.navigateByUrl(RoutesResRoutes.PLAN_REVIEW);
  }

  changeHeaderLabel(changeKmf: boolean) {
    this.amountHeaderLabel = this._staticMsgPipe.transform(changeKmf ? 'label.keepMyFarePayment' : 'heading.price2');
  }
}
