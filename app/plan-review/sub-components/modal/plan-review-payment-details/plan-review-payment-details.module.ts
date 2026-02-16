import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewPaymentDetailsComponent } from './plan-review-payment-details.component';
import { AmountFormatModule, StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { PaymentDetailsSummaryComponent } from './payment-details-summary/payment-details-summary.component';
import { PaymentDetailsBreakdownComponent } from './payment-details-breakdown/payment-details-breakdown.component';
import { PaymentDetailsBreakdownItemComponent } from './payment-details-breakdown/payment-details-breakdown-item/payment-details-breakdown-item.component';
import { BlockSliderModule } from '@common/components';
import { GetAirportListByCountryServiceModule } from '@common/services';
import { MilesFormatModule } from '@common/pipes/miles-format/miles-format.module';

@NgModule({
  declarations: [
    PlanReviewPaymentDetailsComponent,
    PaymentDetailsSummaryComponent,
    PaymentDetailsBreakdownComponent,
    PaymentDetailsBreakdownItemComponent,
  ],
  providers: [StaticMsgPipe],
  imports: [
    CommonModule,
    AmountFormatModule,
    StaticMsgModule,
    BlockSliderModule,
    GetAirportListByCountryServiceModule,
    MilesFormatModule,
  ],
  exports: [PlanReviewPaymentDetailsComponent],
})
export class PlanReviewPaymentDetailsModule {}
