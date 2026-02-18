import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicingSeatmapLayoutDetailModalComponent } from './servicing-seatmap-layout-detail-modal.component';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { ButtonModule } from '@lib/components';

@NgModule({
  declarations: [ServicingSeatmapLayoutDetailModalComponent],
  imports: [CommonModule, StaticMsgModule, ThrottleClickDirectiveModule, ButtonModule],
})
export class ServicingSeatmapLayoutDetailModalModule {}
