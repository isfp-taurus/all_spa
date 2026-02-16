import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewPlanHeaderAreaComponent } from './plan-review-plan-header-area.component';
import { DateFormatModule, StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [PlanReviewPlanHeaderAreaComponent],
  imports: [CommonModule, StaticMsgModule, DateFormatModule],
  exports: [PlanReviewPlanHeaderAreaComponent],
})
export class PlanReviewPlanHeaderAreaModule {}
