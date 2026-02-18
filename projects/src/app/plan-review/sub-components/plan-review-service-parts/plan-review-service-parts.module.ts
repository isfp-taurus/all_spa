import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewServicePartsComponent } from './plan-review-service-parts.component';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { StaticMsgModule } from '@lib/pipes/static-msg/static-msg.module';
import { ButtonModule, TextTooltipModule } from '@lib/components';
import { PlanReviewFBagComponent } from './plan-review-fbag/plan-review-fbag.component';
import PlanReviewLoungeComponent from './plan-review-lounge/plan-review-lounge.component';
import { PlanReviewMealComponent } from './plan-review-meal/plan-review-meal.component';
import { PlanReviewUnappliedSvcApplyBtnComponent } from './plan-review-unapplied-svc-apply-btn/plan-review-unapplied-svc-apply-btn.component';
import { ModalServiceModule } from '@lib/services';
import { PlanReviewServicePartsService } from './plan-review-service-parts.service';
import { CurrentCartStoreServiceModule, PlanReviewStoreServiceModule, DiffEmphServiceModule } from '@common/services';
import { TableSliderModule } from '@common/components';
import { AmountFormatModule, StaticMsgPipe } from '@lib/pipes';
import {
  BaggageApplicationModalModule,
  LoungeApplicationModalModule,
  MealApplicationModalModule,
} from '@app/id-modal/service-application';
import PlanReviewPetComponent from './plan-review-pet/plan-review-pet.component';

@NgModule({
  declarations: [
    PlanReviewServicePartsComponent,
    PlanReviewFBagComponent,
    PlanReviewLoungeComponent,
    PlanReviewMealComponent,
    PlanReviewPetComponent,
    PlanReviewUnappliedSvcApplyBtnComponent,
  ],
  providers: [PlanReviewServicePartsService, StaticMsgPipe],
  imports: [
    CommonModule,
    ButtonModule,
    StaticMsgModule,
    AmountFormatModule,
    ThrottleClickDirectiveModule,
    ModalServiceModule,
    DiffEmphServiceModule,
    CurrentCartStoreServiceModule,
    PlanReviewStoreServiceModule,
    TableSliderModule,
    TextTooltipModule,
    BaggageApplicationModalModule,
    LoungeApplicationModalModule,
    MealApplicationModalModule,
  ],
  exports: [PlanReviewServicePartsComponent],
})
export class PlanReviewServicePartsModule {}
