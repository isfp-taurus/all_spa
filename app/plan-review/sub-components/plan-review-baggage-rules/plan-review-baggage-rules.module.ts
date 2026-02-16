import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewBaggageRulesComponent } from './plan-review-baggage-rules.component';
import { MybookingBaggageRulesModule } from '@common/components';
import { FareConditionsStoreServiceModule, PlanReviewStoreServiceModule } from '@common/services';
import { ModalServiceModule } from '@lib/services';

@NgModule({
  declarations: [PlanReviewBaggageRulesComponent],
  imports: [
    CommonModule,
    MybookingBaggageRulesModule,
    FareConditionsStoreServiceModule,
    PlanReviewStoreServiceModule,
    ModalServiceModule,
  ],
  exports: [PlanReviewBaggageRulesComponent],
})
export class PlanReviewBaggageRulesModule {}
