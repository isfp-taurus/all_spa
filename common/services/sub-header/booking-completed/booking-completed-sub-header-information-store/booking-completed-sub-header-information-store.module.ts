import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { BookingCompletedSubHeaderInformationStoreModule } from '../../../../store/booking-completed-sub-header-information';
import { BookingCompletedSubHeaderInformationStoreService } from './booking-completed-sub-header-information-store.service';

@NgModule({
  providers: [BookingCompletedSubHeaderInformationStoreService],
  imports: [BookingCompletedSubHeaderInformationStoreModule, EffectsModule.forRoot()],
})
export class BookingCompletedSubHeaderInformationStoreServiceModule {}
