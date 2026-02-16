import { NgModule } from '@angular/core';
import { RoundtripFlightAvailabilityDomesticSubHeaderComponent } from './roundtrip-flight-availability-domestic-sub-header.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [RoundtripFlightAvailabilityDomesticSubHeaderComponent],
  imports: [CommonModule, TranslateModule, StaticMsgModule],
  exports: [RoundtripFlightAvailabilityDomesticSubHeaderComponent],
})
export class RoundtripFlightAvailabilityDomesticSubHeaderModule {}
