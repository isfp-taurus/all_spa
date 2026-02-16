import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { OrdersRepriceOrderStoreModule } from '@common/store/orders-reprice-order';
import { OrdersRepriceOrderStoreService } from './orders-reprice-order-store.service';

@NgModule({
  providers: [OrdersRepriceOrderStoreService],
  imports: [OrdersRepriceOrderStoreModule, EffectsModule.forRoot()],
})
export class OrdersRepriceOrderStoreServiceModule {}
