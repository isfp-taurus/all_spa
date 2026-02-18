import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanSaveModalComponent } from './plan-save-modal.component';
import { ButtonModule, InputModule } from '@lib/components';
import {
  CreatePlansStoreServiceModule,
  UpdatePlannameStoreServiceModule,
  GetPlansStoreServiceModule,
  LocalDateServiceModule,
} from '@common/services';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogDisplayServiceModule } from '@lib/services';
import { StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  providers: [StaticMsgPipe],
  declarations: [PlanSaveModalComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    ButtonModule,
    InputModule,
    ReactiveFormsModule,
    GetPlansStoreServiceModule,
    CreatePlansStoreServiceModule,
    UpdatePlannameStoreServiceModule,
    DialogDisplayServiceModule,
    StaticMsgModule,
    LocalDateServiceModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [PlanSaveModalComponent],
})
export class PlanSaveModalModule {}
