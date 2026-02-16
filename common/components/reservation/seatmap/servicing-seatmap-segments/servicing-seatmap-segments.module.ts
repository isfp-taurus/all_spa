import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ServicingSeatmapSegmentsComponent } from './servicing-seatmap-segments.component';
import { DateFormatModule, StaticMsgModule } from '@lib/pipes';
import { SeatmapSegmentsChangeComponent } from './seatmap-segments-change/seatmap-segments-change.component';
import { AirportNameI18nPipeModule } from '@common/pipes/airport-name-i18n/airport-name-i18n.module';
import { CarrierNamePipeModule } from '@common/pipes/carrier-name/carrier-name.module';

@NgModule({
  declarations: [ServicingSeatmapSegmentsComponent, SeatmapSegmentsChangeComponent],
  imports: [CommonModule, StaticMsgModule, AirportNameI18nPipeModule, DateFormatModule, CarrierNamePipeModule],
  exports: [ServicingSeatmapSegmentsComponent],
})
export class ServicingSeatmapSegmentsModule {}
