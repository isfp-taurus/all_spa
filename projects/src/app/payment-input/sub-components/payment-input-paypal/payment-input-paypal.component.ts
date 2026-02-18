import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
/**
 * payment-input-paypal
 * 支払方法；PaPal
 */
@Component({
  selector: 'asw-payment-input-paypal',
  templateUrl: './payment-input-paypal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputPaypalComponent extends SupportComponent {
  constructor(private _common: CommonLibService) {
    super(_common);
  }

  reload(): void {}

  init(): void {}

  destroy(): void {}
}
