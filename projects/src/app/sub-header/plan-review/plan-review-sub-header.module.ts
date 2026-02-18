import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewSubHeaderComponent } from './plan-review-sub-header.component';
import { PlanReviewPlanManipulationMenuModalModule } from '@app/plan-review/sub-components/plan-review-plan-manipulation-menu/plan-review-plan-manipulation-menu-modal/plan-review-plan-manipulation-menu-modal.module';
import { TemporaryUrlModalModule, PlanSaveModalModule } from '@common/components';
import { PlanReviewStoreServiceModule, DeliveryInformationStoreServiceModule } from '@common/services';
import { StaticMsgModule } from '@lib/pipes';
import { ModalServiceModule } from '@lib/services';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PlanReviewSubHeaderComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    ModalServiceModule,
    PlanReviewPlanManipulationMenuModalModule,
    TemporaryUrlModalModule,
    PlanSaveModalModule,
    PlanReviewStoreServiceModule,
    DeliveryInformationStoreServiceModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [PlanReviewSubHeaderComponent],
})
export class PlanReviewSubHeaderModule {}
