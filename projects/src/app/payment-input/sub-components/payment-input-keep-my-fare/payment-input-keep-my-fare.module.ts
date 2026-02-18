import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputKeepMyFareComponent } from './payment-input-keep-my-fare.component';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { TextTooltipModule } from '@lib/components';

@NgModule({
  declarations: [PaymentInputKeepMyFareComponent],
  imports: [CommonModule, StaticMsgModule, AmountFormatModule, TextTooltipModule],
  exports: [PaymentInputKeepMyFareComponent],
})
export class PaymentInputKeepMyFareModule {}
