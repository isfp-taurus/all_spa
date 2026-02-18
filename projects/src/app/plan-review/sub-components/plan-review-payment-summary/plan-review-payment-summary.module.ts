import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewPaymentSummaryComponent } from './plan-review-payment-summary.component';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { PlanReviewPaymentDetailsModule } from '../modal/plan-review-payment-details/plan-review-payment-details.module';
import { ButtonModule } from '@lib/components';
import { DiffEmphServiceModule } from '@common/services';
import { ModalServiceModule } from '@lib/services';
import { MilesFormatModule } from '@common/pipes/miles-format/miles-format.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PlanReviewPaymentSummaryComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    AmountFormatModule,
    PlanReviewPaymentDetailsModule,
    ButtonModule,
    ModalServiceModule,
    DiffEmphServiceModule,
    MilesFormatModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [PlanReviewPaymentSummaryComponent],
})
export class PlanReviewPaymentSummaryModule {}
