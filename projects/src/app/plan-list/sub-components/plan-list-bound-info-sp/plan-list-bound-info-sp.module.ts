import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmountFormatModule, DateFormatModule, StaticMsgModule } from '@lib/pipes';
import { PlanListBoundInfoSpComponent } from './plan-list-bound-info-sp.component';
import { PlanListBoundServiceModule } from '../plan-list-bound-service/plan-list-bound-service.module';

@NgModule({
  declarations: [PlanListBoundInfoSpComponent],
  imports: [
    CommonModule,
    FormsModule,
    AmountFormatModule,
    StaticMsgModule,
    DateFormatModule,
    PlanListBoundServiceModule,
  ],
  exports: [PlanListBoundInfoSpComponent],
})
export class PlanListBoundInfoSpModule {}
