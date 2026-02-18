import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
/**
 * payment-input-unionpay
 * 支払方法；銀聯
 */
@Component({
  selector: 'asw-payment-input-unionpay',
  templateUrl: './payment-input-unionpay.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputUnionpayComponent extends SupportComponent {
  constructor(private _common: CommonLibService) {
    super(_common);
  }

  reload(): void {}

  init(): void {}

  destroy(): void {}
}
