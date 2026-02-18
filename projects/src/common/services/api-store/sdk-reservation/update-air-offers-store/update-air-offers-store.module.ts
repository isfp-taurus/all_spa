import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { UpdateAirOffersStoreModule } from '../../../../store/update-air-offers';
import { UpdateAirOffersStoreService } from './update-air-offers-store.service';

@NgModule({
  providers: [UpdateAirOffersStoreService],
  imports: [UpdateAirOffersStoreModule, EffectsModule.forRoot()],
})
export class UpdateAirOffersStoreServiceModule {}
