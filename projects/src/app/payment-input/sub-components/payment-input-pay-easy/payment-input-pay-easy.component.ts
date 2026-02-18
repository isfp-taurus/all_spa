import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
import { GetOrderResponseData } from 'src/sdk-servicing';
import { PaymentInputScreenEntryInfo, screenEntryData } from '../../container/payment-input-cont.state';
/**
 * payment-input-pay-easy
 * Keep My Fare選択
 */
@Component({
  selector: 'asw-payment-input-pay-easy',
  templateUrl: './payment-input-pay-easy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputPayEasyComponent extends SupportComponent {
  // 画面情報
  @Input() screenEntry: PaymentInputScreenEntryInfo = screenEntryData();
  // PNR情報
  @Input() pnrInfo: GetOrderResponseData | undefined = {};
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

  init(): void {}

  destroy(): void {}
}
