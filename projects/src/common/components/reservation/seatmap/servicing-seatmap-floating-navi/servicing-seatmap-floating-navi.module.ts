import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicingSeatmapFloatingNaviComponent } from './servicing-seatmap-floating-navi.component';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { ServicingSeatmapOpenChildSeatSelectionModalButtonModule } from '../servicing-seatmap-open-child-seat-selection-modal-button/servicing-seatmap-open-child-seat-selection-modal-button.module';
import { IfScreenSizeModule } from '@common/directive/if-screen-size/if-screen-size.module';

@NgModule({
  declarations: [ServicingSeatmapFloatingNaviComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    IfScreenSizeModule,
    ThrottleClickDirectiveModule,
    ServicingSeatmapOpenChildSeatSelectionModalButtonModule,
  ],
  exports: [ServicingSeatmapFloatingNaviComponent],
})
export class ServicingSeatmapFloatingNaviModule {}
