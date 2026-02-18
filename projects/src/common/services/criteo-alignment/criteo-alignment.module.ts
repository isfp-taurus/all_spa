import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RoundtripFlightAvailabilityInternationalStoreServiceModule } from '../roundtripFlightAvailabilityInternational/roundtripFlightAvailabilityInternational.module';
import { CriteoAlignmentService } from './criteo-alignment.service';

@NgModule({
  providers: [CriteoAlignmentService],
  imports: [CommonModule, RoundtripFlightAvailabilityInternationalStoreServiceModule],
})
export class CriteoAlignmentServiceModule {}
