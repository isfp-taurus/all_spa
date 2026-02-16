import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { ComplexFlightCalendarStoreModule } from '../../../../store/complex-flight-calendar/complex-flight-calendar.module';
import { ComplexFlightCalendarStoreService } from './complex-flight-calendar-store.service';

@NgModule({
  providers: [ComplexFlightCalendarStoreService],
  imports: [ComplexFlightCalendarStoreModule, EffectsModule.forRoot()],
})
export class ComplexFlightCalendarStoreServiceModule {}
