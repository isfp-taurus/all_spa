import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { DeliverySearchInformationStoreModule } from '../../../store/delivery-search-information';
import { DeliverySearchInformationStoreService } from './delivery-search-information-store.service';

@NgModule({
  providers: [DeliverySearchInformationStoreService],
  imports: [DeliverySearchInformationStoreModule, EffectsModule.forRoot()],
})
export class DeliverySearchInformationStoreServiceModule {}
