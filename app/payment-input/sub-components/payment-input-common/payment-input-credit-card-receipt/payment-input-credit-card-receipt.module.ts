import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputCreditCardReceiptComponent } from './payment-input-credit-card-receipt.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StaticMsgModule } from '@lib/pipes';
import { InputModule } from '@lib/components';

@NgModule({
  declarations: [PaymentInputCreditCardReceiptComponent],
  exports: [PaymentInputCreditCardReceiptComponent],
  imports: [CommonModule, StaticMsgModule, InputModule, FormsModule, ReactiveFormsModule],
})
export class PaymentInputCreditCardReceiptModule {}
