import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewPlanSaveAreaComponent } from './plan-review-plan-save-area.component';
import { StaticMsgModule } from '@lib/pipes';
import { PlanSaveModalModule } from '@common/components';
import { ButtonModule } from '@lib/components';
import { DialogDisplayServiceModule, ModalServiceModule } from '@lib/services';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PlanReviewPlanSaveAreaComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    ButtonModule,
    ModalServiceModule,
    DialogDisplayServiceModule,
    PlanSaveModalModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [PlanReviewPlanSaveAreaComponent],
})
export class PlanReviewPlanSaveAreaModule {}
