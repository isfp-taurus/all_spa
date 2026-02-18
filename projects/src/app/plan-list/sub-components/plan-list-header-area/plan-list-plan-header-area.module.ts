import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule } from '@lib/pipes';
import { PlanListPlanHeaderAreaComponent } from './plan-list-plan-header-area.component';

@NgModule({
  declarations: [PlanListPlanHeaderAreaComponent],
  imports: [CommonModule, StaticMsgModule],
  exports: [PlanListPlanHeaderAreaComponent],
})
export class PlanListPlanHeaderAreaModule {}
