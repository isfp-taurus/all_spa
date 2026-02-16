import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewAccrualMilesComponent } from './plan-review-accrual-miles.component';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { TextTooltipModule } from '@lib/components';

@NgModule({
  declarations: [PlanReviewAccrualMilesComponent],
  imports: [CommonModule, StaticMsgModule, AmountFormatModule, TextTooltipModule],
  exports: [PlanReviewAccrualMilesComponent],
})
export class PlanReviewAccrualMilesModule {}
