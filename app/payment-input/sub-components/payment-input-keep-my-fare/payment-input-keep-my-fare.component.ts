import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { PaymentInputScreenEntryInfo } from '@app/payment-input/container';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { GetOrderResponseData } from 'src/sdk-servicing';
import { screenEntryData } from '../../container/payment-input-cont.state';
/**
 * payment-input-keep-my-fare
 * Keep My Fare選択
 */
@Component({
  selector: 'asw-payment-input-keep-my-fare',
  templateUrl: './payment-input-keep-my-fare.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputKeepMyFareComponent extends SupportComponent {
  // 画面情報
  @Input() screenEntry: PaymentInputScreenEntryInfo = screenEntryData();
  // PNR情報
  @Input() pnrInfo: GetOrderResponseData | undefined = {};
  // Keep My Fare 選択識別子
  @Input() isKeepMyFare: boolean = true;
  // Keep My Fare 合計金額
  public totalPriceOfKeepMyFare: number = 0;
  public KeepMyFareCurrencyCode?: string;
  // Keep My Fare 搭乗者数
  public numberOfTravelers: number = 1;
  // Keep My Fare選択 トグルスイッチ処理
  @Output() kmfToggle = new EventEmitter<Event>();

  constructor(private _common: CommonLibService, private _changeDetectorRef: ChangeDetectorRef) {
    super(_common);
  }

  /* Keep My Fare選択 トグルスイッチ処理 */
  kmfToggle_x() {
    this.kmfToggle.emit();
  }

  reload(): void {}

  init(): void {
    const keepMyFare = this.pnrInfo?.services?.keepMyFare?.catalogue?.totalPrices;
    // Keep My Fare 合計金額
    this.totalPriceOfKeepMyFare = keepMyFare?.total ?? 0;
    this.KeepMyFareCurrencyCode = keepMyFare?.currencyCode;
    // Keep My Fare 搭乗者数
    this.numberOfTravelers = this.pnrInfo?.travelers?.length ?? 0;
  }

  destroy(): void {}
}
