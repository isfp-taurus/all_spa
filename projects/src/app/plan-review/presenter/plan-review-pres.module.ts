import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewPresComponent } from './plan-review-pres.component';
import { PlanReviewTripSummaryModule } from '../sub-components/plan-review-trip-summary/plan-review-trip-summary.module';
import { PlanReviewPaymentSummaryModule } from '../sub-components/plan-review-payment-summary/plan-review-payment-summary.module';
import { DateFormatModule, StaticMsgModule } from '@lib/pipes';
import { AgreementAreaModule, ButtonModule } from '@lib/components';
import { PlanSaveModalModule } from '@common/components';
import { PlanReviewPlanManipulationMenuModalModule } from '../sub-components/plan-review-plan-manipulation-menu/plan-review-plan-manipulation-menu-modal/plan-review-plan-manipulation-menu-modal.module';
import { PlanReviewPlanManipulationMenuModule } from '../sub-components/plan-review-plan-manipulation-menu/plan-review-plan-manipulation-menu.module';
import { PlanReviewAddPassengerModalModule } from '../sub-components/modal/plan-review-add-passenger-modal/plan-review-add-passenger-modal.module';
import { PlanReviewPassengerNumberAreaModule } from '../sub-components/plan-review-passenger-number-area/plan-review-passenger-number-area.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { PlanReviewPassengerInfoModule } from '../sub-components/plan-review-passenger-info/plan-review-passenger-info.module';
import { PlanReviewServicePartsModule } from '../sub-components/plan-review-service-parts/plan-review-service-parts.module';
import { PlanReviewPlanHeaderAreaModule } from '../sub-components/plan-review-plan-header-area/plan-review-plan-header-area.module';
import { PlanReviewAccrualMilesModule } from '../sub-components/plan-review-accrual-miles/plan-review-accrual-miles.module';
import { PlanReviewPlanSaveAreaModule } from '../sub-components/plan-review-plan-save-area/plan-review-plan-save-area.module';
import { PlanReviewCriteoModule } from '../sub-components/plan-review-criteo/plan-review-criteo.module';
import { PlanReviewBaggageRulesModule } from '../sub-components/plan-review-baggage-rules/plan-review-baggage-rules.module';
import { PlanReviewFareConditionsModule } from '../sub-components/plan-review-fare-conditions/plan-review-fare-conditions.module';
import {
  CurrentCartStoreServiceModule,
  CurrentPlanStoreServiceModule,
  DcsDateServiceModule,
  LocalDateServiceModule,
  PlanReviewStoreServiceModule,
} from '@common/services';
import { SelectNextPageModalModule } from '@app/id-modal/passenger-information-request/modal/select-next-page-modal/select-next-page-modal.module';
import { PlanReviewFooterModule } from '../sub-components/plan-review-footer/plan-review-footer.module';
import { PlanReviewPresService } from './plan-review-pres.service';

@NgModule({
  declarations: [PlanReviewPresComponent],
  providers: [PlanReviewPresService],
  imports: [
    ThrottleClickDirectiveModule,
    CommonModule,
    StaticMsgModule,
    DateFormatModule,
    PlanReviewPlanHeaderAreaModule,
    PlanReviewTripSummaryModule,
    PlanReviewPassengerInfoModule,
    PlanReviewPaymentSummaryModule,
    PlanReviewPassengerNumberAreaModule,
    PlanReviewAccrualMilesModule,
    PlanReviewBaggageRulesModule,
    PlanReviewPlanManipulationMenuModalModule,
    PlanReviewPlanManipulationMenuModule,
    PlanReviewPlanSaveAreaModule,
    PlanSaveModalModule,
    PlanReviewCriteoModule,
    PlanReviewFooterModule,
    ButtonModule,
    PlanReviewAddPassengerModalModule,
    AgreementAreaModule,
    PlanReviewServicePartsModule,
    PlanReviewFareConditionsModule,
    SelectNextPageModalModule,
    CurrentCartStoreServiceModule,
    CurrentPlanStoreServiceModule,
    PlanReviewStoreServiceModule,
    DcsDateServiceModule,
    LocalDateServiceModule,
  ],
  exports: [PlanReviewPresComponent],
})
export class PlanReviewPresModule {}
