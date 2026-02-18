import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputAlipayComponent } from './payment-input-alipay.component';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [PaymentInputAlipayComponent],
  exports: [PaymentInputAlipayComponent],
  imports: [CommonModule, StaticMsgModule],
})
export class PaymentInputAlipayModule {}
