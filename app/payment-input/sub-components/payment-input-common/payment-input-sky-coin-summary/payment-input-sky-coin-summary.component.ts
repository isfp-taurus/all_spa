import { ChangeDetectionStrategy, Component, Input, ChangeDetectorRef } from '@angular/core';
import { CommonLibService } from '@lib/services';
import { GetOrderResponseData } from 'src/sdk-servicing';
import { SubComponentModelComponent } from '@common/components/feature-parts/sub-conponent-model/sub-component-model.component';
import {
  PaymentInputRequestPaymentInputSkyCoinSummaryData,
  PaymentInputRequestPaymentInputSkyCoinSummaryParts,
  initPaymentInputSkyCoinSummaryData,
  initPaymentInputSkyCoinSummaryParts,
} from './payment-input-sky-coin-summary.state';
import { AnaSkyCoinInfo } from '../../../container';
/**
 * payment-input-sky-coin-summary
 * 支払方法；ANA SKYコイン(ANA SKYコイン支払情報)
 */
@Component({
  selector: 'asw-payment-input-sky-coin-summary',
  styleUrls: ['./payment-input-sky-coin-summary.component.scss'],
  templateUrl: './payment-input-sky-coin-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputSkyCoinSummaryComponent extends SubComponentModelComponent<
  PaymentInputRequestPaymentInputSkyCoinSummaryData,
  PaymentInputRequestPaymentInputSkyCoinSummaryParts
> {
  // SubComponentModelComponent用初期設定
  _data = initPaymentInputSkyCoinSummaryData();
  _parts = initPaymentInputSkyCoinSummaryParts();
  setDataEvent(): void {
    this.calcPrice();
    this.refresh();
  }
  setPartsEvent(): void {
    this.calcPrice();
    this.refresh();
  }
  calcPrice() {
    if (!this.parts || !this.data) {
      return;
    }
    this.totalPrice = this.parts.totalPrice;
    this.totalPriceCurrency = this.parts.totalPriceCurrency;
    this.totalUseCoin = this.data.totalUseCoin;
    this.totalCredit = this.totalPrice - this.totalUseCoin < 0 ? 0 : this.totalPrice - this.totalUseCoin;
  }

  public refresh() {
    this._changeDetectorRef.markForCheck();
  }
  public update() {
    this.dataChange.emit(this._data);
  }

  // PNR情報
  @Input() pnrInfo: GetOrderResponseData | undefined = {};

  @Input() anaSkyCoinInfoList: Array<AnaSkyCoinInfo> | undefined;

  @Input() totalUseCoinStatus: string = '';

  constructor(private _common: CommonLibService, private _changeDetectorRef: ChangeDetectorRef) {
    super(_changeDetectorRef, _common);
  }
  @Input() isAnaSkyCoinCombination: boolean | undefined;
  @Input() totalUseCoin: number = 0;
  @Input() totalCredit: number = 0;
  // 支払総額
  public totalPrice: number = 0;
  public totalPriceCurrency: string = '';

  reload(): void {}

  init(): void {}

  destroy(): void {}

  /**
   * 画面情報表示処理用
   */
  resetPartsEvent(): void {
    this.setPartsEvent();
  }
}
