import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ServicingSeatmapLegendsComponent } from './servicing-seatmap-legends.component';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [ServicingSeatmapLegendsComponent],
  imports: [CommonModule, StaticMsgModule],
  exports: [ServicingSeatmapLegendsComponent],
})
export class ServicingSeatmapLegendsModule {}
