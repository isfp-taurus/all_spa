import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewFareConditionsComponent } from './plan-review-fare-conditions.component';
import {
  CurrentCartStoreServiceModule,
  FareConditionsStoreServiceModule,
  PlanReviewStoreServiceModule,
} from '@common/services';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { ButtonModule, TextTooltipModule } from '@lib/components';
import { PlanReviewFareConditionsPerPtcComponent } from './plan-review-fare-conditions-per-ptc/plan-review-fare-conditions-per-ptc.component';
import { ModalServiceModule } from '@lib/services';
import { FareConditionDetailsModalModule, TableSliderModule } from '@common/components';
import { PlanReviewFareConditionsService } from './plan-review-fare-conditions.service';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PlanReviewFareConditionsComponent, PlanReviewFareConditionsPerPtcComponent],
  providers: [PlanReviewFareConditionsService, StaticMsgPipe],
  imports: [
    CommonModule,
    FareConditionsStoreServiceModule,
    PlanReviewStoreServiceModule,
    CurrentCartStoreServiceModule,
    StaticMsgModule,
    ButtonModule,
    ModalServiceModule,
    FareConditionDetailsModalModule,
    TableSliderModule,
    TextTooltipModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [PlanReviewFareConditionsComponent],
})
export class PlanReviewFareConditionsModule {}
