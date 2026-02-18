import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicingSeatmapLegendsModalComponent } from './servicing-seatmap-legends-modal.component';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [ServicingSeatmapLegendsModalComponent],
  imports: [CommonModule, StaticMsgModule],
  exports: [ServicingSeatmapLegendsModalComponent],
})
export class ServicingSeatmapLegendsModalModule {}
