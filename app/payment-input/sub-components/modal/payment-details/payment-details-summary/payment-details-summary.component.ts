import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { PaymentDetailsSummaryData, initPaymentDetailsSummaryData } from './payment-details-summary.state';
import { AwardDetails } from '../payment-details.state';
import { StaticMsgPipe } from '@lib/pipes';

/**
 * 支払情報詳細モーダル
 */
@Component({
  selector: 'asw-payment-details-summary',
  templateUrl: './payment-details-summary.component.html',
  styleUrls: ['./payment-details-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailsSummaryComponent extends SupportComponent {
  constructor(
    private _common: CommonLibService,
    public changeDetectorRef: ChangeDetectorRef,
    private _staticMsg: StaticMsgPipe
  ) {
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
  public _data: PaymentDetailsSummaryData = initPaymentDetailsSummaryData();
  /** 特典データ */
  @Input() paymentDetailsAwardData?: AwardDetails;

  public isNone = false; //差分なしフラグ
  public isPromotion = false; //promotionフラグ
  public isTotalFare = true; //運賃総額表示フラグ
  @Input()
  get isCanada(): boolean {
    return this._isCanada;
  }
  set isCanada(value: boolean) {
    this._isCanada = value;
    this.refresh();
  }
  public _isCanada = true;

  public passengerNumbersText: string = '';

  init(): void {}

  reload(): void {}

  destroy(): void {}

  /**
   * 設定値の初期化
   */
  public refresh() {
    this.isTotalFare = !this.isCanada || this.data.flightSurcharges === 0;
    this.passengerNumbersText = this.formatPassengerNumbersForDisplay();
    this.changeDetectorRef.markForCheck();
  }

  /**
   * 搭乗者人数の表示用のテキストを作成する
   */
  private formatPassengerNumbersForDisplay(): string {
    let passengerNumbers: string[] = [];
    this.data.passenger.forEach((passengerInfo) => {
      if (passengerInfo.num) {
        passengerNumbers.push(`${passengerInfo.num} ${this._staticMsg.transform(passengerInfo.label)}`);
      }
    });
    return passengerNumbers.join(', ');
  }
}
