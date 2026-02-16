import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { PlanListPlanDeleteFooterComponent } from './plan-list-plan-delete-footer.component';
import { PlanListStoreServiceModule } from '@common/services';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PlanListPlanDeleteFooterComponent],
  imports: [
    CommonModule,
    FormsModule,
    AmountFormatModule,
    StaticMsgModule,
    PlanListStoreServiceModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [PlanListPlanDeleteFooterComponent],
})
export class PlanListPlanDeleteFooterModule {}
