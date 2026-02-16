import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputPaypalComponent } from './payment-input-paypal.component';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [PaymentInputPaypalComponent],
  exports: [PaymentInputPaypalComponent],
  imports: [CommonModule, StaticMsgModule],
})
export class PaymentInputPaypalModule {}
