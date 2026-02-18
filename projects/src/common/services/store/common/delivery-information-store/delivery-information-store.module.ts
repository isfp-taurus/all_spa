import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { DeliveryInformationStoreModule } from '../../../../store/delivery-information';
import { DeliveryInformationStoreService } from './delivery-information-store.service';

@NgModule({
  providers: [DeliveryInformationStoreService],
  imports: [DeliveryInformationStoreModule, EffectsModule.forRoot()],
})
export class DeliveryInformationStoreServiceModule {}
