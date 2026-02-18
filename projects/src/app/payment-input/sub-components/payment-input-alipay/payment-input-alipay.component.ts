import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
/**
 * payment-input-alipay
 * 支払方法：Alipay
 */
@Component({
  selector: 'asw-payment-input-alipay',
  templateUrl: './payment-input-alipay.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputAlipayComponent extends SupportComponent {
  constructor(private _common: CommonLibService) {
    super(_common);
  }

  reload(): void {}

  init(): void {}

  destroy(): void {}
}
