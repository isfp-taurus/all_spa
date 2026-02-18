import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule } from '@lib/pipes';
import { DeviceIfDirectiveModule } from '../common/directives';
import { RoundtripFlightAvailabilityDomesticPresComponent } from './roundtrip-flight-availability-domestic-pres.component';
import {
  FlightBoundContModule,
  SearchResultFooterModule,
  TravelerNumbersPresModule,
  ResultFlightFunctionContModule,
} from '../common/components';
import { CriteoAlignmentModule } from '@common/components';
import { DateFormatModule } from '../../../lib/pipes/date-format/date-format.module';

/**
 * 往復空席照会結果(国内)PresModule
 */
@NgModule({
  declarations: [RoundtripFlightAvailabilityDomesticPresComponent],
  exports: [RoundtripFlightAvailabilityDomesticPresComponent],
  imports: [
    CommonModule,
    FlightBoundContModule,
    SearchResultFooterModule,
    TravelerNumbersPresModule,
    StaticMsgModule,
    DeviceIfDirectiveModule,
    ResultFlightFunctionContModule,
    CriteoAlignmentModule,
    DateFormatModule,
  ],
})
export class RoundtripFlightAvailabilityDomesticPresModule {}
