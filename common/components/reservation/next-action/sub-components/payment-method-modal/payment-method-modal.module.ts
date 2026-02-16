import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethodModalComponent } from './payment-method-modal.component';
import { StaticMsgModule } from '@lib/pipes/static-msg/static-msg.module';
import { TextTooltipModule } from '@lib/components/base-ui-components/tooltip/tooltip.module';

@NgModule({
  declarations: [PaymentMethodModalComponent],
  imports: [CommonModule, StaticMsgModule, TextTooltipModule],
  exports: [PaymentMethodModalComponent],
})
export class PaymentMethodModalModule {}
