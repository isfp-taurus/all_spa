import { NgModule } from '@angular/core';
import { RoundtripFlightAvailabilityInternationalStoreModule } from '../../store/roundtripFlightAvailabilityInternational';
import { RoundtripFlightAvailabilityInternationalService } from './roundtripFlightAvailabilityInternational.service';

@NgModule({
  providers: [RoundtripFlightAvailabilityInternationalService],
  imports: [RoundtripFlightAvailabilityInternationalStoreModule],
})
export class RoundtripFlightAvailabilityInternationalStoreServiceModule {}
