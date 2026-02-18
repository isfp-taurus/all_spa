import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewPlanManipulationMenuComponent } from './plan-review-plan-manipulation-menu.component';
import { ButtonModule, InputModule } from '@lib/components';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import {
  AmountFormatModule,
  AmountFormatPipe,
  DateFormatModule,
  DateFormatPipe,
  StaticMsgModule,
  StaticMsgPipe,
} from '@lib/pipes';
import { DialogDisplayServiceModule, ModalServiceModule } from '@lib/services';
import { PlanReviewPlanManipulationMenuService } from './plan-review-plan-manipulation-menu.service';
import { PlanSaveModalModule, TemporaryUrlModalModule } from '@common/components';
import {
  GetPlansStoreServiceModule,
  UpdatePlannameStoreServiceModule,
  CurrentCartStoreServiceModule,
  GetEstimationStoreServiceModule,
  DeletePlansStoreServiceModule,
  LocalPlanServiceModule,
  PlanReviewStoreServiceModule,
  GetAirportListByCountryServiceModule,
  CreatePlansStoreServiceModule,
} from '@common/services';

@NgModule({
  declarations: [PlanReviewPlanManipulationMenuComponent],
  providers: [PlanReviewPlanManipulationMenuService, StaticMsgPipe, AmountFormatPipe, DateFormatPipe],
  imports: [
    CommonModule,
    StaticMsgModule,
    AmountFormatModule,
    DateFormatModule,
    ButtonModule,
    InputModule,
    ThrottleClickDirectiveModule,
    ModalServiceModule,
    DialogDisplayServiceModule,
    GetPlansStoreServiceModule,
    UpdatePlannameStoreServiceModule,
    GetEstimationStoreServiceModule,
    DeletePlansStoreServiceModule,
    CreatePlansStoreServiceModule,
    TemporaryUrlModalModule,
    PlanSaveModalModule,
    LocalPlanServiceModule,
    CurrentCartStoreServiceModule,
    PlanReviewStoreServiceModule,
    GetAirportListByCountryServiceModule,
  ],
  exports: [PlanReviewPlanManipulationMenuComponent],
})
export class PlanReviewPlanManipulationMenuModule {}
