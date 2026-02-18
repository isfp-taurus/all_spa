import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputInternetBankingComponent } from './payment-input-internet-banking.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from '@lib/components';
import { StaticMsgModule } from '@lib/pipes';
import { CheckboxModule } from '@lib/components/base-ui-components/form/checkbox/checkbox.module';

@NgModule({
  declarations: [PaymentInputInternetBankingComponent],
  exports: [PaymentInputInternetBankingComponent],
  imports: [CommonModule, SelectModule, StaticMsgModule, FormsModule, ReactiveFormsModule, CheckboxModule],
})
export class PaymentInputInternetBankingModule {}
