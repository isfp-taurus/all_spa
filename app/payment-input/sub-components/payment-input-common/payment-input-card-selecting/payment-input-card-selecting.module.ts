import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputCardSelectingComponent } from './payment-input-card-selecting.component';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PaymentInputCardSelectingComponent],
  exports: [PaymentInputCardSelectingComponent],
  imports: [CommonModule, StaticMsgModule, ThrottleClickDirectiveModule],
})
export class PaymentInputCardSelectingModule {}
