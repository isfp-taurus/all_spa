import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanListPresComponent } from './plan-list-pres.component';
import { FormsModule } from '@angular/forms';
import { AmountFormatModule, DateFormatModule, StaticMsgModule } from '@lib/pipes';
import { PlanListPlanDeleteFooterModule } from '../sub-components/plan-list-plan-delete-footer/plan-list-plan-delete-footer.module';
import { PlanListMergeInfoModule } from '../sub-components/plan-list-merge-info/plan-list-merge-info.module';
import { PlanListSearchFlightInfoModule } from '../sub-components/plan-list-search-flight-info/plan-list-search-flight-info.module';
import { PlanListPlanInformationModule } from '../sub-components/plan-list-plan-information/plan-list-plan-information.module';
import { PlanListPlanInfoListModule } from '../sub-components/plan-list-plan-info-list/plan-list-plan-info-list.module';
import { PlanListLoadModule } from '../sub-components/plan-list-load/plan-list-load.module';
import { PlanListPlanHeaderAreaModule } from '../sub-components/plan-list-header-area/plan-list-plan-header-area.module';
import { PlanListBoundInfoModule } from '../sub-components/plan-list-bound-info/plan-list-bound-info.module';

@NgModule({
  declarations: [PlanListPresComponent],
  imports: [
    CommonModule,
    FormsModule,
    DateFormatModule,
    AmountFormatModule,
    StaticMsgModule,
    PlanListPlanDeleteFooterModule,
    PlanListSearchFlightInfoModule,
    PlanListMergeInfoModule,
    PlanListPlanInformationModule,
    PlanListPlanInfoListModule,
    PlanListLoadModule,
    PlanListPlanHeaderAreaModule,
    PlanListBoundInfoModule,
  ],
  exports: [PlanListPresComponent],
})
export class PlanListPresModule {}
