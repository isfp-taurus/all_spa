import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentInputConvenienceStoreComponent } from './payment-input-convenience-store.component';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [PaymentInputConvenienceStoreComponent],
  exports: [PaymentInputConvenienceStoreComponent],
  imports: [CommonModule, StaticMsgModule],
})
export class PaymentInputConvenienceStoreModule {}
