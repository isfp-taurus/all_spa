import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputRequestCardInformationComponent } from './payment-input-card-info.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule, InputModule, SelectDateYmModule } from '@lib/components';
import { StaticMsgModule } from '@lib/pipes';
import { PaymentInputCardInfoService } from './payment-input-card-info.service';

@NgModule({
  declarations: [PaymentInputRequestCardInformationComponent],
  providers: [PaymentInputCardInfoService],
  exports: [PaymentInputRequestCardInformationComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    CheckboxModule,
    InputModule,
    SelectDateYmModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class PaymentInputCardInfoModule {}
