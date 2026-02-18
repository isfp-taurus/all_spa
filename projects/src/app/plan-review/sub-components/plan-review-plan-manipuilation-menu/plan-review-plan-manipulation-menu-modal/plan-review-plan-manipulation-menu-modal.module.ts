import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewPlanManipulationMenuModalComponent } from './plan-review-plan-manipulation-menu-modal.component';
import { PlanReviewPlanManipulationMenuModule } from '../plan-review-plan-manipulation-menu.module';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [PlanReviewPlanManipulationMenuModalComponent],
  imports: [CommonModule, StaticMsgModule, PlanReviewPlanManipulationMenuModule],
  exports: [PlanReviewPlanManipulationMenuModalComponent],
})
export class PlanReviewPlanManipulationMenuModalModule {}
