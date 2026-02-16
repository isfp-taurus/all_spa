import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { OrdersPaymentRecordsStoreModule } from '@common/store/orders-payment-records';
import { OrdersPaymentRecordsStoreService } from './orders-payment-records-store.service';

@NgModule({
  providers: [OrdersPaymentRecordsStoreService],
  imports: [OrdersPaymentRecordsStoreModule, EffectsModule.forRoot()],
})
export class OrdersPaymentRecordsStoreServiceModule {}
