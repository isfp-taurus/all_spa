import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnabizPaymentInputCardInfoComponent } from './anabiz-payment-input-card-info.component';
import { StaticMsgModule } from '@lib/pipes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule, InputModule, SelectDateYmModule } from '@lib/components';

@NgModule({
  declarations: [AnabizPaymentInputCardInfoComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    CheckboxModule,
    InputModule,
    SelectDateYmModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [AnabizPaymentInputCardInfoComponent],
})
export class AnabizPaymentInputCardInfoModule {}
