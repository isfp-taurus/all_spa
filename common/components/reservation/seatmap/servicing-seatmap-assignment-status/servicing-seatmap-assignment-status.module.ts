import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ServicingSeatmapAssignmentStatusComponent } from './servicing-seatmap-assignment-status.component';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { IfScreenSizeModule } from '../../../../directive/if-screen-size/if-screen-size.module';

@NgModule({
  declarations: [ServicingSeatmapAssignmentStatusComponent],
  imports: [CommonModule, StaticMsgModule, IfScreenSizeModule, ThrottleClickDirectiveModule],
  exports: [ServicingSeatmapAssignmentStatusComponent],
})
export class ServicingSeatmapAssignmentStatusModule {}
