import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanListContComponent } from './plan-list-cont.component';
import { PlanListPresModule } from '../presenter/plan-list-pres.module';
import { RouterModule } from '@angular/router';
import { DateFormatModule, StaticMsgModule } from '@lib/pipes';
import {
  CreatePlansStoreServiceModule,
  DeletePlansStoreServiceModule,
  GetCartStoreServiceModule,
  GetPlansStoreServiceModule,
  GetUnavailablePaymentByOfficeCodeServiceModule,
  LocalPlanServiceModule,
  PlanListServiceModule,
  PlanListStoreServiceModule,
} from '@common/services';

@NgModule({
  declarations: [PlanListContComponent],
  imports: [
    RouterModule.forChild([{ path: '', component: PlanListContComponent }]),
    CommonModule,
    DateFormatModule,
    PlanListPresModule,
    GetPlansStoreServiceModule,
    GetCartStoreServiceModule,
    LocalPlanServiceModule,
    DeletePlansStoreServiceModule,
    CreatePlansStoreServiceModule,
    PlanListStoreServiceModule,
    PlanListServiceModule,
    StaticMsgModule,
    GetUnavailablePaymentByOfficeCodeServiceModule,
  ],
  exports: [PlanListContComponent],
})
export class PlanListContModule {}
