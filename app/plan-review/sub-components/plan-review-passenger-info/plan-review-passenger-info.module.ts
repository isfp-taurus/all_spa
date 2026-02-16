import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewPassengerInfoComponent } from './plan-review-passenger-info.component';
import { ButtonModule } from '@lib/components';
import { DateFormatModule, StaticMsgModule, StaticMsgPipe } from '@lib/pipes';
import { PlanReviewPassengerIndividualInfoComponent } from './plan-review-passenger-individual-info/plan-review-passenger-individual-info.component';
import { PlanReviewRepresentativeContactsComponent } from './plan-review-representative-contacts/plan-review-representative-contacts.component';
import { DialogDisplayServiceModule, ModalServiceModule } from '@lib/services';
import {
  CancelPrebookServiceModule,
  CurrentCartStoreServiceModule,
  PlanReviewStoreServiceModule,
  DeleteTravelerStoreServiceModule,
  DiffEmphServiceModule,
  DcsDateServiceModule,
} from '@common/services';
import { PlanReviewPassengerInfoService } from './plan-review-passenger-info-service';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [
    PlanReviewPassengerInfoComponent,
    PlanReviewRepresentativeContactsComponent,
    PlanReviewPassengerIndividualInfoComponent,
  ],
  providers: [PlanReviewPassengerInfoService, StaticMsgPipe],
  imports: [
    CommonModule,
    StaticMsgModule,
    DateFormatModule,
    ButtonModule,
    ModalServiceModule,
    DialogDisplayServiceModule,
    DeleteTravelerStoreServiceModule,
    DeleteTravelerStoreServiceModule,
    CurrentCartStoreServiceModule,
    CancelPrebookServiceModule,
    PlanReviewStoreServiceModule,
    DiffEmphServiceModule,
    DcsDateServiceModule,
    ThrottleClickDirectiveModule,
  ],
  exports: [PlanReviewPassengerInfoComponent],
})
export class PlanReviewPassengerInfoModule {}
