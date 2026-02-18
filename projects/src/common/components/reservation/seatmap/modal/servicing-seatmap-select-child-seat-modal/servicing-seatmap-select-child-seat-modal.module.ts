import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicingSeatmapSelectChildSeatModalComponent } from './servicing-seatmap-select-child-seat-modal.component';
import { StaticMsgModule } from '@lib/pipes';
import { ServicingSeatmapSelectChildSeatModalPassengerModule } from './servicing-seatmap-select-child-seat-modal-passenger/servicing-seatmap-select-child-seat-modal-passenger.module';
import { ButtonModule, TextTooltipModule } from '@lib/components';
import { ThrottleClickDirectiveModule, TooltipDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [ServicingSeatmapSelectChildSeatModalComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    ServicingSeatmapSelectChildSeatModalPassengerModule,
    ButtonModule,
    ThrottleClickDirectiveModule,
    TextTooltipModule,
    TooltipDirectiveModule,
  ],
  exports: [ServicingSeatmapSelectChildSeatModalComponent],
})
export class ServicingSeatmapSelectChildSeatModalModule {}
