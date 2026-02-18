import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputSkyCoinSummaryComponent } from './payment-input-sky-coin-summary.component';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [PaymentInputSkyCoinSummaryComponent],
  exports: [PaymentInputSkyCoinSummaryComponent],
  imports: [CommonModule, StaticMsgModule, AmountFormatModule],
})
export class PaymentInputSkyCoinSummaryModule {}
