import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatmapContComponent } from './seatmap-cont.component';
import { SeatmapPresModule } from '../presenter';
import { RouterModule } from '@angular/router';
import { GetSeatmapsStoreServiceModule } from '@common/services/api-store/sdk-servicing/get-seatmaps-store/get-seatmaps-store.module';
import { CurrentSeatmapServiceModule } from '@common/services/store/current-seatmap/current-seatmap-store.module';
import { UpdateServicesStoreServiceModule } from '@common/services/api-store/sdk-servicing/update-services-store/update-services-store.module';
import { CurrentCartStoreServiceModule } from '@common/services';
@NgModule({
  declarations: [SeatmapContComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: SeatmapContComponent }]),
    CommonModule,
    GetSeatmapsStoreServiceModule,
    UpdateServicesStoreServiceModule,
    SeatmapPresModule,
    CurrentSeatmapServiceModule,
    CurrentCartStoreServiceModule,
  ],
  exports: [SeatmapContComponent],
})
export class SeatmapContModule {}
