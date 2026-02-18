import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicingSeatmapPaidSeatDetailConfirmationComponent } from './servicing-seatmap-paid-seat-detail-confirmation.component';
import { ThrottleClickDirectiveModule, TooltipDirectiveModule } from '@lib/directives';
import { StaticMsgModule, AmountFormatModule } from '@lib/pipes';
import { ButtonModule, TextTooltipModule } from '@lib/components';
import { PaidSeatDetailConfirmationService } from './servicing-seatmap-paid-seat-detail-confirmation.service';

@NgModule({
  providers: [PaidSeatDetailConfirmationService],
  declarations: [ServicingSeatmapPaidSeatDetailConfirmationComponent],
  exports: [ServicingSeatmapPaidSeatDetailConfirmationComponent],
  imports: [
    CommonModule,
    ThrottleClickDirectiveModule,
    StaticMsgModule,
    ButtonModule,
    AmountFormatModule,
    TextTooltipModule,
    TooltipDirectiveModule,
  ],
})
export class ServicingSeatmapPaidSeatDetailConfirmationModule {}
