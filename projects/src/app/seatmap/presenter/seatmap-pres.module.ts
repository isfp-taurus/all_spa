import { CommonModule } from '@angular/common';
import { SeatmapPresComponent } from './seatmap-pres.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { StaticMsgModule } from '@lib/pipes';
import { ServicingSeatmapLegendsModule } from '@common/components/reservation/seatmap/servicing-seatmap-legends/servicing-seatmap-legends.module';
import { SeatmapFooterAreaModule } from '@common/components/reservation/seatmap/seatmap-footer-area/seatmap-footer-area.module';
import { ServicingSeatmapFloatingNaviModule } from '@common/components/reservation/seatmap/servicing-seatmap-floating-navi/servicing-seatmap-floating-navi.module';
import {
  ServicingSeatmapAssignmentStatusModule,
  ServicingSeatmapLegendsModalModule,
  ServicingSeatmapOpenChildSeatSelectionModalButtonModule,
  ServicingSeatmapSeatmapModule,
  ServicingSeatmapSegmentsModule,
  ServicingSeatmapSelectChildSeatModalModule,
} from '@common/components';
import { ServicingSeatmapSeatProductsModule } from '@common/components';
import { SeatmapPresService } from './seatmap-pres.service';
import { ServicingSeatmapPaidSeatDetailConfirmationModule } from '../../../common/components/reservation/seatmap/modal/servicing-seatmap-paid-seat-detail-confirmation/servicing-seatmap-paid-seat-detail-confirmation.module';
import { IfScreenSizeModule } from '@common/directive/if-screen-size/if-screen-size.module';
@NgModule({
  providers: [SeatmapPresService],
  declarations: [SeatmapPresComponent],
  exports: [SeatmapPresComponent],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    StaticMsgModule,
    ServicingSeatmapSegmentsModule,
    ServicingSeatmapLegendsModule,
    ServicingSeatmapFloatingNaviModule,
    SeatmapFooterAreaModule,
    IfScreenSizeModule,
    ServicingSeatmapSeatProductsModule,
    ServicingSeatmapAssignmentStatusModule,
    ServicingSeatmapLegendsModalModule,
    ServicingSeatmapSelectChildSeatModalModule,
    ServicingSeatmapOpenChildSeatSelectionModalButtonModule,
    ServicingSeatmapPaidSeatDetailConfirmationModule,
    ServicingSeatmapSeatmapModule,
  ],
  schemas: [],
})
export class SeatmapPresModule {}
