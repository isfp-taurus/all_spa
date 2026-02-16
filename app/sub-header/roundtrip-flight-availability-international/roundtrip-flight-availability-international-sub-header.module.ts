import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RoundtripFlightAvailabilityInternationalSubHeaderComponent } from './roundtrip-flight-availability-international-sub-header.component';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [RoundtripFlightAvailabilityInternationalSubHeaderComponent],
  imports: [CommonModule, TranslateModule, StaticMsgModule, ThrottleClickDirectiveModule],
  exports: [RoundtripFlightAvailabilityInternationalSubHeaderComponent],
})
export class RoundtripFlightAvailabilityInternationalSubHeaderModule {}
