import { NgModule } from '@angular/core';
import { CreateOrderStoreModule, UpdateTravelersStoreModule } from '@common/store';
import { EffectsModule } from '@ngrx/effects';
import { UpdateTravelersInformationStoreService } from './update-travelers-store.service';

@NgModule({
  providers: [UpdateTravelersInformationStoreService],
  imports: [CreateOrderStoreModule, UpdateTravelersStoreModule, EffectsModule.forRoot()],
})
export class UpdateTravelersStoreServiceModule {}
