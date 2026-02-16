import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FlightSummaryAndFareFamilyComponent } from './flight-summary-and-fare-family.component';
import { TranslateModule } from '@ngx-translate/core';
import { AmountFormatModule, DateFormatModule, StaticMsgModule } from '@lib/pipes';
import { FlightPlanModule } from '../flight-plan/flight-plan.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [FlightSummaryAndFareFamilyComponent],
  imports: [
    CommonModule,
    TranslateModule,
    DateFormatModule,
    AmountFormatModule,
    FlightPlanModule,
    StaticMsgModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [FlightSummaryAndFareFamilyComponent],
  providers: [DatePipe],
})
export class FlightSummaryAndFareFamilyModule {}
