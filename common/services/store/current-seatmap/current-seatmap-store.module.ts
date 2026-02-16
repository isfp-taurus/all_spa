import { NgModule } from '@angular/core';
import { CurrentSeatmapStoreModule } from '@common/store';
import { CurrentSeatmapService } from './current-seatmap-store.service';

@NgModule({
  providers: [CurrentSeatmapService],
  imports: [CurrentSeatmapStoreModule],
})
export class CurrentSeatmapServiceModule {}
