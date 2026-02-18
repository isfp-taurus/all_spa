import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicingSeatmapSeatProductsModalComponent } from './servicing-seatmap-seat-products-modal.component';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [ServicingSeatmapSeatProductsModalComponent],
  imports: [CommonModule, StaticMsgModule, ThrottleClickDirectiveModule],
  exports: [ServicingSeatmapSeatProductsModalComponent],
})
export class ServicingSeatmapSeatProductsModalModule {}
