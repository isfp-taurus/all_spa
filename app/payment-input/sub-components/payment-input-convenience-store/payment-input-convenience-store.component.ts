import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SupportComponent } from '@lib/components/support-class';
import { CommonLibService } from '@lib/services';
/**
 * payment-input-convenience-store
 * 支払方法；コンビニエンスストア
 */
@Component({
  selector: 'asw-payment-input-convenience-store',
  templateUrl: './payment-input-convenience-store.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentInputConvenienceStoreComponent extends SupportComponent {
  constructor(private _common: CommonLibService) {
    super(_common);
  }

  reload(): void {}

  init(): void {}

  destroy(): void {}
}
