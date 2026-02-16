import { NgModule } from '@angular/core';
import { MyBookingStoreModule } from '../../store/mybooking';
import { MyBookingStoreService } from './myBooking-store.service';

@NgModule({
  providers: [MyBookingStoreService],
  imports: [MyBookingStoreModule],
})
export class MyBookingStoreServiceModule {}
