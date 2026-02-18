import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FmFSearchResultComponent } from './fmf-search-result.component';
import { TranslateModule } from '@ngx-translate/core';
import { AmountFormatModule, DateFormatModule, StaticMsgModule } from '@lib/pipes';
import { FmFFlightPlanModule } from '../fmf-flight-plan/fmf-flight-plan.module';
import { FlightDetailModalService } from '@common/components/shopping/flight-detail/flight-detail-modal.service';
import { FlightDetailModule } from '@common/components/shopping/flight-detail/flight-detail.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { FlightPlanService } from '@common/components/shopping/flight-plan/flight-plan.service';
import { TextTooltipModule } from '@lib/components';
import { RoundtripFlightAvailabilityInternationalPresService } from '@app/roundtrip-flight-availability-international/presenter/roundtrip-flight-availability-international-pres.service';

@NgModule({
  declarations: [FmFSearchResultComponent],
  imports: [
    CommonModule,
    TranslateModule,
    DateFormatModule,
    AmountFormatModule,
    FmFFlightPlanModule,
    StaticMsgModule,
    FlightDetailModule,
    ThrottleClickDirectiveModule,
    TextTooltipModule,
  ],
  exports: [FmFSearchResultComponent],
  providers: [
    DatePipe,
    FlightDetailModalService,
    FlightPlanService,
    RoundtripFlightAvailabilityInternationalPresService,
  ],
})
export class FmFSearchResultModule {}
