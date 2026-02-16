import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewAgreementKrModalComponent } from './plan-review-agreement-kr-modal.component';
import { ButtonModule, CheckboxModule } from '@lib/components';
import { ReactiveFormsModule } from '@angular/forms';
import { StaticMsgModule } from '@lib/pipes';
import { PlanReviewStoreServiceModule } from '@common/services';

@NgModule({
  declarations: [PlanReviewAgreementKrModalComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    ButtonModule,
    CheckboxModule,
    ReactiveFormsModule,
    PlanReviewStoreServiceModule,
  ],
  exports: [PlanReviewAgreementKrModalComponent],
})
export class PlanReviewAgreementKrModalModule {}
