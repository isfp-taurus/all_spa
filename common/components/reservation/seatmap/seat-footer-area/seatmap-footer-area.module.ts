import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatmapFooterAreaComponent } from './seatmap-footer-area.component';
import { StaticMsgModule } from '@lib/pipes';
import { ButtonModule } from '@lib/components';

@NgModule({
  declarations: [SeatmapFooterAreaComponent],
  imports: [StaticMsgModule, CommonModule, ButtonModule],
  exports: [SeatmapFooterAreaComponent],
})
export class SeatmapFooterAreaModule {}
