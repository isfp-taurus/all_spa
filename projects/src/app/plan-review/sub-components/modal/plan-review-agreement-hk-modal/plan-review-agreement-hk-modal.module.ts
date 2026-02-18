import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewAgreementHkModalComponent } from './plan-review-agreement-hk-modal.component';
import { ButtonModule, CheckboxModule } from '@lib/components';
import { ReactiveFormsModule } from '@angular/forms';
import { StaticMsgModule } from '@lib/pipes';
import { PlanReviewStoreServiceModule } from '@common/services';

@NgModule({
  declarations: [PlanReviewAgreementHkModalComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    ButtonModule,
    CheckboxModule,
    ReactiveFormsModule,
    PlanReviewStoreServiceModule,
  ],
  exports: [PlanReviewAgreementHkModalComponent],
})
export class PlanReviewAgreementHkModalModule {}
