import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentInputCardHolderInfoComponent } from './payment-input-card-holder-info.component';
import { InputModule, SelectModule } from '@lib/components';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [PaymentInputCardHolderInfoComponent],
  exports: [PaymentInputCardHolderInfoComponent],
  imports: [CommonModule, InputModule, SelectModule, StaticMsgModule, FormsModule, ReactiveFormsModule],
})
export class PaymentInputCardHolderInfoModule {}
