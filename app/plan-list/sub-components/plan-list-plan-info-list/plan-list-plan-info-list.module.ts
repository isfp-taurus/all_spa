import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { PlanListPlanInfoListComponent } from './plan-list-plan-info-list.component';
import { PlanListPlanInformationModule } from '../plan-list-plan-information/plan-list-plan-information.module';
import { PlanListBoundInfoModule } from '../plan-list-bound-info/plan-list-bound-info.module';
import { PlanListLoadModule } from '../plan-list-load/plan-list-load.module';

@NgModule({
  declarations: [PlanListPlanInfoListComponent],
  imports: [
    CommonModule,
    FormsModule,
    AmountFormatModule,
    StaticMsgModule,
    PlanListPlanInformationModule,
    PlanListBoundInfoModule,
    PlanListLoadModule,
  ],
  exports: [PlanListPlanInfoListComponent],
})
export class PlanListPlanInfoListModule {}
