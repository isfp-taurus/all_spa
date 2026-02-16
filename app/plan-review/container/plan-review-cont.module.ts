import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewContComponent } from './plan-review-cont.component';
import { PlanReviewPresModule } from '../presenter/plan-review-pres.module';
import { RouterModule } from '@angular/router';
import { PlanReviewAgreementHkModalModule } from '../sub-components/modal/plan-review-agreement-hk-modal/plan-review-agreement-hk-modal.module';
import { PlanReviewAgreementKrModalModule } from '../sub-components/modal/plan-review-agreement-kr-modal/plan-review-agreement-kr-modal.module';
import { PlanReviewPassengerNumberAreaModule } from '../sub-components/plan-review-passenger-number-area/plan-review-passenger-number-area.module';
import {
  GetCartStoreServiceModule,
  GetPlansStoreServiceModule,
  CreateCartStoreServiceModule,
  UpdatePlannameStoreServiceModule,
  CurrentCartStoreServiceModule,
  CurrentPlanStoreServiceModule,
  PlanReviewStoreServiceModule,
  DeliveryInformationStoreServiceModule,
  UpsellServiceModule,
  DcsDateServiceModule,
  FareConditionsStoreServiceModule,
  GetUnavailablePaymentByOfficeCodeServiceModule,
} from '@common/services';
import { ModalServiceModule } from '@lib/services';
import { DateFormatModule, StaticMsgPipe } from '@lib/pipes';
import { PlanReviewContService } from './plan-review-cont.service';

@NgModule({
  declarations: [PlanReviewContComponent],
  providers: [PlanReviewContService, StaticMsgPipe],
  imports: [
    RouterModule.forChild([{ path: '', component: PlanReviewContComponent }]),
    CommonModule,
    ModalServiceModule,
    PlanReviewPresModule,
    GetCartStoreServiceModule,
    GetPlansStoreServiceModule,
    CreateCartStoreServiceModule,
    UpdatePlannameStoreServiceModule,
    CurrentPlanStoreServiceModule,
    CurrentCartStoreServiceModule,
    DeliveryInformationStoreServiceModule,
    PlanReviewAgreementHkModalModule,
    PlanReviewAgreementKrModalModule,
    PlanReviewPassengerNumberAreaModule,
    PlanReviewStoreServiceModule,
    UpsellServiceModule,
    DateFormatModule,
    DcsDateServiceModule,
    FareConditionsStoreServiceModule,
    GetUnavailablePaymentByOfficeCodeServiceModule,
  ],
  exports: [PlanReviewContComponent],
})
export class PlanReviewContModule {}
