import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewTripSummaryComponent } from './plan-review-trip-summary.component';
import { ButtonModule, InputModule, TextTooltipModule } from '@lib/components';
import {
  DateFormatModule,
  StaticMsgModule,
  StaticMsgPipe,
  MetaUrlModule,
  PopupIndicatorPipeModule,
  LinkStylePipeModule,
} from '@lib/pipes';
import { DialogDisplayServiceModule } from '@lib/services';
import { PlanReviewTripSummaryService } from './plan-review-trip-summary.service';
import {
  CurrentCartStoreServiceModule,
  DiffEmphServiceModule,
  FindMoreFlightsStoreServiceModule,
  DcsDateServiceModule,
} from '@common/services';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PlanReviewTripSummaryComponent],
  providers: [PlanReviewTripSummaryService, StaticMsgPipe],
  imports: [
    CommonModule,
    StaticMsgModule,
    PopupIndicatorPipeModule,
    LinkStylePipeModule,
    ButtonModule,
    TextTooltipModule,
    DialogDisplayServiceModule,
    InputModule,
    DateFormatModule,
    CurrentCartStoreServiceModule,
    DiffEmphServiceModule,
    FindMoreFlightsStoreServiceModule,
    DcsDateServiceModule,
    ThrottleClickDirectiveModule,
    MetaUrlModule,
  ],
  exports: [PlanReviewTripSummaryComponent],
})
export class PlanReviewTripSummaryModule {}
