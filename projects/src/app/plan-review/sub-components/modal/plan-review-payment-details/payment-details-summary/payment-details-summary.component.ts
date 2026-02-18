import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { PaymentDetailsSummaryAmountType, PaymentDetailsSummaryData } from './payment-details-summary.state';
import { AwardDetails } from '../plan-review-payment-details.state';
import { AppConstants } from '@conf/app.constants';

/**
 * 支払情報詳細モーダル サマリ部
 */
@Component({
  selector: 'asw-payment-details-summary',
  templateUrl: './payment-details-summary.component.html',
  styleUrls: ['./payment-details-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailsSummaryComponent extends SupportComponent {
  public appConstants = AppConstants;

  constructor(private _common: CommonLibService, private _changeDetectorRef: ChangeDetectorRef) {
    super(_common);
  }

  @Input()
  set data(value: PaymentDetailsSummaryData) {
    this._data = value;
    this.refresh();
  }
  get data() {
    return this._data;
  }
  public _data: PaymentDetailsSummaryData = {
    totalAmount: 0,
    amountType: PaymentDetailsSummaryAmountType.NONE,
    originalTotal: 0,
    travelersSummaryStr: '',
    promotionCode: '',
    totalFare: 0,
    totalFlightSurcharge: 0,
    airTransportationCharges: 0,
    totalTax: 0,
    thirdPartyCharges: 0,
    ancillaryTotalWithoutTax: 0,
    ancillaryTotalTax: 0,
    alertLabelTxt: [],
    currencyCode: undefined,
  };

  @Input() isCanada = false;

  /** 特典データ */
  @Input() paymentDetailsAwardData?: AwardDetails;

  public isNone = false; //差分なしフラグ
  public isDel = false; //プラン削除フラグ
  public isDiff = false; //差分強調フラグ

  init(): void {}

  reload(): void {}

  destroy(): void {}

  /**
   * 設定値の初期化
   */
  public refresh() {
    this.isDel = this.data.amountType === PaymentDetailsSummaryAmountType.DEL;
    this.isDiff = this.data.amountType === PaymentDetailsSummaryAmountType.DIFF;
    this.isNone = !(this.isDel || this.isDiff);
    this._changeDetectorRef.markForCheck();
  }
}
