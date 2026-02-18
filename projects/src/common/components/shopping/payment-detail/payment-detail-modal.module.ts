import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentDetailModalComponent } from './payment-detail-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule, AmountFormatModule } from '@lib/pipes';

@NgModule({
  declarations: [PaymentDetailModalComponent],
  imports: [CommonModule, TranslateModule, StaticMsgModule, AmountFormatModule],
  exports: [PaymentDetailModalComponent],
})
export class PaymentDetailModalModule {}
