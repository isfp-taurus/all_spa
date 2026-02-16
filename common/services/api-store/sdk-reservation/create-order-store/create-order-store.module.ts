import { NgModule } from '@angular/core';
import { CreateOrderStoreModule } from '@common/store/create-order';
import { EffectsModule } from '@ngrx/effects';
import { CreateOrderStoreService } from './create-order-store.service';

@NgModule({
  providers: [CreateOrderStoreService],
  imports: [CreateOrderStoreModule, EffectsModule.forRoot()],
})
export class CreateOrderStoreServiceModule {}
