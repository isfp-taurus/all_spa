import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnabizPaymentInputCardHolderComponent } from './anabiz-payment-input-card-holder.component';
import { StaticMsgModule } from '@lib/pipes';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputModule, SelectModule } from '@lib/components';

@NgModule({
  declarations: [AnabizPaymentInputCardHolderComponent],
  imports: [CommonModule, InputModule, SelectModule, StaticMsgModule, FormsModule, ReactiveFormsModule],
  exports: [AnabizPaymentInputCardHolderComponent],
})
export class AnabizPaymentInputCardHolderModule {}
