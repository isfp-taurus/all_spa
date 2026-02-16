import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputPaymentAmountComponent } from './payment-input-payment-amount.component';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { RouterModule } from '@angular/router';
import { MilesFormatModule } from '@common/pipes/miles-format/miles-format.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PaymentInputPaymentAmountComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    AmountFormatModule,
    RouterModule,
    MilesFormatModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [PaymentInputPaymentAmountComponent],
})
export class PaymentInputPaymentAmountModule {}
