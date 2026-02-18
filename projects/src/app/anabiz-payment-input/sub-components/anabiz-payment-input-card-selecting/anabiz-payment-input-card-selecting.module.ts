import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnabizPaymentInputCardSelectingComponent } from './anabiz-payment-input-card-selecting.component';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [AnabizPaymentInputCardSelectingComponent],
  imports: [CommonModule, StaticMsgModule, ThrottleClickDirectiveModule],
  exports: [AnabizPaymentInputCardSelectingComponent],
})
export class AnabizPaymentInputCardSelectingModule {}
