import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { defaultDispPassengerName, getPassengerLabel } from '@common/helper';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import {
  PaymentDetailsBreakdownItemData,
  initPaymentDetailsBreakdownItemData,
} from './payment-details-breakdown-item.state';
import { StaticMsgPipe } from '@lib/pipes';
import { AwardDetails } from '../../payment-details.state';

/**
 * 支払情報詳細モーダル 下部　内訳部分
 */
@Component({
  selector: 'asw-payment-details-breakdown-item',
  templateUrl: './payment-details-breakdown-item.component.html',
  styleUrls: ['./payment-details-breakdown-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailsBreakdownItemComponent extends SupportComponent implements OnChanges {
  constructor(
    private _common: CommonLibService,
    public changeDetectorRef: ChangeDetectorRef,
    private __staticMsg: StaticMsgPipe
  ) {
    super(_common);
  }

  @Input()
  set data(value: PaymentDetailsBreakdownItemData) {
    this._data = value;
    this.refresh();
  }
  get data(): PaymentDetailsBreakdownItemData {
    return this._data;
  }
  public _data: PaymentDetailsBreakdownItemData = initPaymentDetailsBreakdownItemData();

  /** 呼び出し元にてngForで付与したindex */
  @Input() index = 0;

  @Input()
  get isCanada(): boolean {
    return this._isCanada;
  }
  set isCanada(value: boolean) {
    this._isCanada = value;
    this.changeDetectorRef.markForCheck();
  }
  public _isCanada = true;

  @Input()
  get isMalaysia(): boolean {
    return this._isMalaysia;
  }
  set isMalaysia(value: boolean) {
    this._isMalaysia = value;
    this.changeDetectorRef.markForCheck();
  }
  public _isMalaysia = true;

  /** 税金マスタから取得した文言 */
  @Input() mTaxMsgs: { [key: string]: string } = {};

  /** 特典データ */
  @Input() paymentDetailsAwardData?: AwardDetails;

  /** 搭乗者ごとのマイル数 */
  public paxRequiredMiles: number = 0;

  /** 特典フラグ */
  public isAwardBooking = false;

  public dispName = '';
  public type = 'm_static_message-label.adult';
  public taxes: Array<{ name: string; value: number }> = [{ name: '税金', value: 100 }];
  public ancillaryTaxes: Array<{ name: string; value: number }> = [{ name: '税金', value: 100 }];

  init(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    this.isAwardBooking = this.paymentDetailsAwardData?.isAwardBooking ?? false;
    // 特典かつ搭乗者が幼児の場合０円固定、それ以外は特典マイルが表示される
    if (this.isAwardBooking) {
      if (this.data.type === 'INF') {
        this.paxRequiredMiles = 0;
      } else {
        this.paxRequiredMiles = this.paymentDetailsAwardData?.paxRequiredMiles ?? 0;
      }
    }
    this.changeDetectorRef.markForCheck();
  }

  reload(): void {}

  destroy(): void {}

  /**
   * 設定値の初期化
   */
  public refresh() {
    if (this.data.names) {
      this.dispName = defaultDispPassengerName(this.data.names ?? {});
    } else {
      this.dispName = this.__staticMsg.transform('label.passenger.n', { '0': this.data.id });
    }
    this.type = getPassengerLabel(this.data.type);

    this.taxes = this.data.ticketPricesTaxes.map((tax) => {
      return {
        name: tax.name, //税金コード=当該税金.codeとなる税金情報.税金名称
        value: tax.value,
      };
    });

    this.changeDetectorRef.markForCheck();
  }
}
