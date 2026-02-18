import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicingSeatmapOpenChildSeatSelectionModalButtonComponent } from './servicing-seatmap-open-child-seat-selection-modal-button.component';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { IfScreenSizeModule } from '@common/directive/if-screen-size/if-screen-size.module';

@NgModule({
  declarations: [ServicingSeatmapOpenChildSeatSelectionModalButtonComponent],
  imports: [CommonModule, StaticMsgModule, ThrottleClickDirectiveModule, IfScreenSizeModule],
  exports: [ServicingSeatmapOpenChildSeatSelectionModalButtonComponent],
})
export class ServicingSeatmapOpenChildSeatSelectionModalButtonModule {}
