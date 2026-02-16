import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewAddPassengerModalComponent } from './plan-review-add-passenger-modal.component';
import { CancelPrebookServiceModule } from '@common/services/cancel-prebook/cancel-prebook.module';
import { AddTravelersStoreServiceModule } from '@common/services/api-store/sdk-reservation/add-travelers-store/add-travelers-store.module';
import { ThrottleClickDirectiveModule } from '@lib/directives';
import { AlertAreaModule } from '@lib/components';
import { StaticMsgModule } from '@lib/pipes';

@NgModule({
  declarations: [PlanReviewAddPassengerModalComponent],
  imports: [
    CommonModule,
    StaticMsgModule,
    CancelPrebookServiceModule,
    AddTravelersStoreServiceModule,
    ThrottleClickDirectiveModule,
    AlertAreaModule,
  ],
  exports: [PlanReviewAddPassengerModalComponent],
})
export class PlanReviewAddPassengerModalModule {}
