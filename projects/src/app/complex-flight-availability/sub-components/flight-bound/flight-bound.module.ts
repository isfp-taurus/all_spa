import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlightPlanService } from '@common/components/shopping/flight-plan/flight-plan.service';
import { StaticMsgModule } from '@lib/pipes';
import { DateFormatModule } from '@lib/pipes/date-format/date-format.module';
import { TranslateModule } from '@ngx-translate/core';
import { FlightBoundComponent } from './flight-bound.component';
import { FindMoreFlightsStoreService } from '@common/services';
import { TextTooltipModule } from '@lib/components';
import { TooltipDirectiveModule } from '@lib/directives';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [FlightBoundComponent],
  imports: [
    CommonModule,
    TranslateModule,
    DateFormatModule,
    StaticMsgModule,
    TextTooltipModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [FlightBoundComponent],
  providers: [FlightPlanService, FindMoreFlightsStoreService],
})
export class FlightBoundModule {}
