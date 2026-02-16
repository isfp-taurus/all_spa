import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ComplexFlightAvailabilityPresModule } from '../presenter/complex-flight-availability-pres.module';
import { ComplexFlightAvailabilityContComponent } from './complex-flight-availability-cont.component';
import { ComplexFlightAvailabilityRequestService } from '../service/request.service';
import { ComplexFlightAvailabilityStoreService } from '../service/store.service';
import { ComplexFlightAvailabilityUntilService } from '../service/utils.service';
import { FindMoreFlightsStoreService } from '@common/services/store/find-more-flights/find-more-flights-store/find-more-flights-store.service';
import { ComplexFlightAvailabilityEventService } from '../service/event.service';
import { ComplexFlightAvailabilityPageStoreService } from '@common/services/store/complex-flight-availability/complex-flight-availability-store/complex-flight-availability-store.service';
import { GetUnavailablePaymentByOfficeCodeServiceModule } from '@common/services';

@NgModule({
  declarations: [ComplexFlightAvailabilityContComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: ComplexFlightAvailabilityContComponent }]),
    CommonModule,
    ComplexFlightAvailabilityPresModule,
    GetUnavailablePaymentByOfficeCodeServiceModule,
  ],
  exports: [ComplexFlightAvailabilityContComponent],
  providers: [
    ComplexFlightAvailabilityRequestService,
    ComplexFlightAvailabilityStoreService,
    ComplexFlightAvailabilityPageStoreService,
    ComplexFlightAvailabilityUntilService,
    ComplexFlightAvailabilityEventService,
    FindMoreFlightsStoreService,
  ],
})
export class ComplexFlightAvailabilityContModule {}
