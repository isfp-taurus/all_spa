import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersReservationAvailabilityStoreService } from './orders-reservation-availability-store.service';
import { OrdersReservationAvailabilityStoreModule } from '@common/store/orders-reservation-availability';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  declarations: [],
  providers: [OrdersReservationAvailabilityStoreService],
  imports: [CommonModule, OrdersReservationAvailabilityStoreModule, EffectsModule.forRoot()],
})
export class OrdersReservationAvailabilityStoreServiceModule {}
