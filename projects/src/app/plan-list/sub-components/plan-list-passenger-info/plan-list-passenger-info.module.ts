import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaticMsgModule } from '@lib/pipes';
import { PlanListPassengerInfoComponent } from './plan-list-passenger-info.component';

@NgModule({
  declarations: [PlanListPassengerInfoComponent],
  imports: [CommonModule, FormsModule, StaticMsgModule],
  exports: [PlanListPassengerInfoComponent],
})
export class PlanListPassengerInfoModule {}
