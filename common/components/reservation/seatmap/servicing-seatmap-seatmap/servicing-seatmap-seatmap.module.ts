import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ServicingSeatmapSeatmapComponent } from './servicing-seatmap-seatmap.component';
import { StaticMsgModule } from '@lib/pipes';
import { SeatmapFacilityComponent } from './seatmap-facility/seatmap-facility.component';
import { SeatmapSeatComponent } from './seatmap-seat/seatmap-seat.component';
import { VerticalSlidePerModule } from '@common/directive/base-if-directive/vertical-slide-per/vertical-slide-per.module';
import { HorizontalSlidePerModule } from '@common/directive/base-if-directive/horizontal-slide-per/horizontal-slide-per.module';
import { SeatmapCouchSeatComponent } from './seatmap-couch-seat/seatmap-couch-seat.component';
import { ServicingSeatmapSeatmapService } from './servicing-seatmap-seatmap.service';

@NgModule({
  providers: [ServicingSeatmapSeatmapService],
  declarations: [
    ServicingSeatmapSeatmapComponent,
    SeatmapFacilityComponent,
    SeatmapSeatComponent,
    SeatmapCouchSeatComponent,
  ],
  imports: [CommonModule, StaticMsgModule, VerticalSlidePerModule, HorizontalSlidePerModule],
  exports: [ServicingSeatmapSeatmapComponent],
})
export class ServicingSeatmapSeatmapModule {}
