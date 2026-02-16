import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputUnionpayComponent } from './payment-input-unionpay.component';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [PaymentInputUnionpayComponent],
  exports: [PaymentInputUnionpayComponent],
  imports: [CommonModule, StaticMsgModule],
})
export class PaymentInputUnionpayModule {}
