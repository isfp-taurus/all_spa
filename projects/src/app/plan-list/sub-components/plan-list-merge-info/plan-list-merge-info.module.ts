import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AmountFormatModule, StaticMsgModule } from '@lib/pipes';
import { PlanListMergeInfoComponent } from './plan-list-merge-info.component';

@NgModule({
  declarations: [PlanListMergeInfoComponent],
  imports: [CommonModule, FormsModule, AmountFormatModule, StaticMsgModule],
  exports: [PlanListMergeInfoComponent],
})
export class PlanListMergeInfoModule {}
