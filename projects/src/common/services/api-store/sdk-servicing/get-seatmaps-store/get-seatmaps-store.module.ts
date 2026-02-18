import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { GetOrderStoreModule } from '../../../../store/get-order';
import { GetSeatmapsStoreService } from './get-seatmaps-store.service';
import { SeatmapsStoreModule } from '@common/store';

@NgModule({
  providers: [GetSeatmapsStoreService],
  imports: [SeatmapsStoreModule, EffectsModule.forRoot()],
})
export class GetSeatmapsStoreServiceModule {}
