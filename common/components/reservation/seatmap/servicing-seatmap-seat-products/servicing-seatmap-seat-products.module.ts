import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ServicingSeatmapSeatProductsComponent } from './servicing-seatmap-seat-products.component';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [ServicingSeatmapSeatProductsComponent],
  imports: [CommonModule, StaticMsgModule],
  exports: [ServicingSeatmapSeatProductsComponent],
})
export class ServicingSeatmapSeatProductsModule {}
