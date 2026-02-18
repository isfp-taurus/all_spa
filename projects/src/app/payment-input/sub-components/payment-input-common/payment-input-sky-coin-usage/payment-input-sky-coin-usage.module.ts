import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputSkyCoinUsageComponent } from './payment-input-sky-coin-usage.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StaticMsgModule } from '@lib/pipes';
import { InputWithSubLabelModule } from '../../../common/input/input-with-sub-label.module';
import { InputAmountsModule } from '../../../common/input-amounts/input-amounts.module';
import { InputModule } from '@lib/components';

@NgModule({
  declarations: [PaymentInputSkyCoinUsageComponent],
  exports: [PaymentInputSkyCoinUsageComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    InputWithSubLabelModule,
    InputModule,
    InputAmountsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class PaymentInputSkyCoinUsageModule {}
