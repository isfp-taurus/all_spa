import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { CartsUpdateServicesStoreService } from './carts-update-services-store.service';
import { CartsUpdateServicesStoreModule } from '../../../../store/carts-update-services/carts-update-services.module';

@NgModule({
  providers: [CartsUpdateServicesStoreService],
  imports: [CartsUpdateServicesStoreModule, EffectsModule.forRoot()],
})
export class CartsUpdateServicesStoreServiceModule {}
