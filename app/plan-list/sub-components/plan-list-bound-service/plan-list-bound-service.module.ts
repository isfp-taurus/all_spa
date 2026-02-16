import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaticMsgModule } from '@lib/pipes';
import { PlanListBoundServiceComponent } from './plan-list-bound-service.component';

@NgModule({
  declarations: [PlanListBoundServiceComponent],
  imports: [CommonModule, FormsModule, StaticMsgModule],
  exports: [PlanListBoundServiceComponent],
})
export class PlanListBoundServiceModule {}
