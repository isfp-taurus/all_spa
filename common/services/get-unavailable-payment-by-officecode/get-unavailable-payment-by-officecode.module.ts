import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GetUnavailablePaymentByOfficeCodeService } from './get-unavailable-payment-by-officecode.service';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  providers: [GetUnavailablePaymentByOfficeCodeService],
  imports: [CommonModule, StaticMsgModule],
})
export class GetUnavailablePaymentByOfficeCodeServiceModule {}
