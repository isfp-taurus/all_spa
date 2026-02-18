import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchFlightBodyPresComponent } from './search-flight-body-pres.component';
import { TabModule, AirportModule } from '@lib/components';
import { TranslateModule } from '@ngx-translate/core';
import { OnewayOrMulticityModule } from '../sub-components/oneway-or-multicity/oneway-or-multicity.module';
import { RoundtripModule } from '../sub-components/roundtrip/roundtrip.module';
import { StaticMsgModule } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [SearchFlightBodyPresComponent],
  imports: [
    CommonModule,
    TabModule,
    TranslateModule,
    AirportModule,
    RoundtripModule,
    OnewayOrMulticityModule,
    StaticMsgModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [SearchFlightBodyPresComponent],
})
export class SearchFlightBodyPresModule {}
