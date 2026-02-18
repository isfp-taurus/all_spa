import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmountFormatModule, DateFormatModule, StaticMsgModule } from '@lib/pipes';
import { PlanListBoundInfoComponent } from './plan-list-bound-info.component';
import { PlanListBoundServiceModule } from '../plan-list-bound-service/plan-list-bound-service.module';

@NgModule({
  declarations: [PlanListBoundInfoComponent],
  imports: [
    CommonModule,
    FormsModule,
    AmountFormatModule,
    StaticMsgModule,
    DateFormatModule,
    PlanListBoundServiceModule,
  ],
  exports: [PlanListBoundInfoComponent],
})
export class PlanListBoundInfoModule {}
