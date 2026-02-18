import { NgModule } from '@angular/core';
import { FindMoreFlightsStoreModule } from '@common/store';
import { EffectsModule } from '@ngrx/effects';
import { FindMoreFlightsStoreService } from './find-more-flights-store.service';

@NgModule({
  providers: [FindMoreFlightsStoreService],
  imports: [FindMoreFlightsStoreModule, EffectsModule.forRoot()],
})
export class FindMoreFlightsStoreServiceModule {}
