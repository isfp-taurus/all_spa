import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewPassengerNumberAreaComponent as PlanReviewPassengerNumberAreaComponent } from './plan-review-passenger-number-area.component';
import { ButtonModule } from '@lib/components';
import { ModalServiceModule } from '@lib/services';
import { PlanReviewAddPassengerModalModule } from '../modal/plan-review-add-passenger-modal/plan-review-add-passenger-modal.module';
import { StaticMsgModule } from '@lib/pipes';
import { DcsDateServiceModule } from '@common/services';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PlanReviewPassengerNumberAreaComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    ButtonModule,
    ModalServiceModule,
    PlanReviewAddPassengerModalModule,
    DcsDateServiceModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [PlanReviewPassengerNumberAreaComponent],
})
export class PlanReviewPassengerNumberAreaModule {}
