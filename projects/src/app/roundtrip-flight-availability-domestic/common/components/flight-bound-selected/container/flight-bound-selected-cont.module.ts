import { NgModule } from '@angular/core';
import { FlightBoundSelectedContComponent } from './flight-bound-selected-cont.component';
import { FlightBoundSelectedPresModule } from '../presenter/flight-bound-selected-pres.module';
import { FlightDetailsModalModule } from '../../../components/flight-details-modal/flight-details-modal.module';

/**
 * 選択中TS・FF情報ContModule
 */
@NgModule({
  declarations: [FlightBoundSelectedContComponent],
  imports: [FlightBoundSelectedPresModule, FlightDetailsModalModule],
  exports: [FlightBoundSelectedContComponent],
})
export class FlightBoundSelectedContModule {}
