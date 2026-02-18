import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputPayEasyComponent } from './payment-input-pay-easy.component';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [PaymentInputPayEasyComponent],
  imports: [CommonModule, StaticMsgModule, AmountFormatModule],
  exports: [PaymentInputPayEasyComponent],
})
export class PaymentInputPayEasyModule {}
