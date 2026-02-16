import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { AmountFormatModule, DateFormatModule, ParamsTranslateModule, StaticMsgModule } from '@lib/pipes';
import { PlanListPlanInformationComponent } from './plan-list-plan-information.component';
import { CurrentCartStoreServiceModule, CurrentPlanStoreServiceModule } from '@common/services';
import { PlanListBoundServiceModule } from '../plan-list-bound-service/plan-list-bound-service.module';
import { PlanListPassengerInfoModule } from '../plan-list-passenger-info/plan-list-passenger-info.module';
import { PlanListBoundInfoModule } from '../plan-list-bound-info/plan-list-bound-info.module';
import { PlanListBoundInfoSpModule } from '../plan-list-bound-info-sp/plan-list-bound-info-sp.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { PlanListLoadBoundModule } from '../plan-list-load-bound/plan-list-load-bound.module';

@NgModule({
  declarations: [PlanListPlanInformationComponent],
  imports: [
    CommonModule,
    TranslateModule,
    ParamsTranslateModule,
    FormsModule,
    AmountFormatModule,
    StaticMsgModule,
    DateFormatModule,
    CurrentPlanStoreServiceModule,
    CurrentCartStoreServiceModule,
    PlanListBoundServiceModule,
    PlanListPassengerInfoModule,
    PlanListBoundInfoModule,
    PlanListBoundInfoSpModule,
    PlanListLoadBoundModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [PlanListPlanInformationComponent],
})
export class PlanListPlanInformationModule {}
