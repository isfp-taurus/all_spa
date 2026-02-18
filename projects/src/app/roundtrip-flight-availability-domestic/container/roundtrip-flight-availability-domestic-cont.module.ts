import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoundtripFlightAvailabilityDomesticPresModule } from '../presenter';
import { RouterModule } from '@angular/router';
import { RoundtripFlightAvailabilityDomesticContComponent } from './roundtrip-flight-availability-domestic-cont.component';
import { GetUnavailablePaymentByOfficeCodeServiceModule } from '@common/services';

/**
 * 往復空席照会結果(国内)ContModule
 */
@NgModule({
  declarations: [RoundtripFlightAvailabilityDomesticContComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: RoundtripFlightAvailabilityDomesticContComponent }]),
    CommonModule,
    RoundtripFlightAvailabilityDomesticPresModule,
    GetUnavailablePaymentByOfficeCodeServiceModule,
  ],
  exports: [RoundtripFlightAvailabilityDomesticContComponent],
})
export class RoundtripFlightAvailabilityDomesticContModule {}
