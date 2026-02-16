import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StaticMsgModule } from '@lib/pipes';
import { SeatmapSubHeaderComponent } from './seatmap-sub-header.component';
import { ModalServiceModule } from '@lib/services';
import { DesignatedSituationDetailsPnrModalModule } from '@common/components';

@NgModule({
  declarations: [SeatmapSubHeaderComponent],
  imports: [CommonModule, StaticMsgModule, ModalServiceModule, DesignatedSituationDetailsPnrModalModule],
  providers: [],
  exports: [SeatmapSubHeaderComponent],
})
export class SeatmapSubHeaderModule {}
