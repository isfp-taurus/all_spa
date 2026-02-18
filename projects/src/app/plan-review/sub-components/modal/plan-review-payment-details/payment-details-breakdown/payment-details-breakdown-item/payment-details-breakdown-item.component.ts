import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { PaymentDetailsBreakdownItemData } from './payment-details-breakdown-item.state';
import { AwardDetails } from '../../plan-review-payment-details.state';

/**
 * 支払情報詳細モーダル 下部　内訳部分
 */
@Component({
  selector: 'asw-payment-details-breakdown-item',
  templateUrl: './payment-details-breakdown-item.component.html',
  styleUrls: ['./payment-details-breakdown-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailsBreakdownItemComponent extends SupportComponent {
  constructor(private _common: CommonLibService, private _changeDetectorRef: ChangeDetectorRef) {
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
  public _data: PaymentDetailsBreakdownItemData = {
    id: '',
    dispName: '',
    ptc: '',
    unitTicketBase: 0,
    flightSurcharge: 0,
    fuelSurcharge: 0,
    insuranceSurcharge: 0,
    taxesPerCountry: [],
    firstBaggageValue: 0,
    loungeValue: 0,
    mealValue: 0,
    ancillaryTaxes: [],
    currencyCode: undefined,
  };

  /** 呼び出し元にてngForで付与したindex */
  @Input() index = 0;

  @Input() isCanada = false;
  @Input() isMalaysia = false;

  /** 税金マスタから取得した文言 */
  @Input() mTaxMsgs: { [key: string]: string } = {};

  /** 特典データ */
  @Input() paymentDetailsAwardData?: AwardDetails;

  /** 搭乗者ごとのマイル数 */
  public paxRequiredMiles: number = 0;

  /** 特典フラグ */
  public isAwardBooking = false;

  /** Ancillaryサービスが存在するか否か */
  public isAncillarySvcExists = false;

  /** 各国税額 */
  public taxesPerCountry: Array<{ name: string; value: number }> = [];

  /** Ancillaryサービス税額 */
  public ancillaryTaxes: Array<{ name: string; value: number }> = [];

  init(): void {
    this.isAwardBooking = this.paymentDetailsAwardData?.isAwardBooking ?? false;
    // 特典かつ搭乗者が幼児の場合０円固定、それ以外は特典マイルが表示される
    if (this.isAwardBooking) {
      if (this.data.ptc === 'INF') {
        this.paxRequiredMiles = 0;
      } else {
        this.paxRequiredMiles = this.paymentDetailsAwardData?.paxRequiredMiles ?? 0;
      }
    }
    this._changeDetectorRef.markForCheck();
  }

  reload(): void {}

  destroy(): void {}

  /**
   * 設定値の初期化
   */
  refresh(): void {
    this.taxesPerCountry = this.data.taxesPerCountry.map((tax) => ({
      name: tax.name, //税金コード=当該税金.codeとなる税金情報.税金名称
      value: tax.value,
    }));

    this._changeDetectorRef.markForCheck();
  }
}
