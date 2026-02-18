import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlanReviewCriteoComponent } from './plan-review-criteo.component';
import { CriteoAlignmentModule } from '@common/components';
import { CriteoAlignmentServiceModule, DeliveryInformationStoreServiceModule } from '@common/services';

@NgModule({
  declarations: [PlanReviewCriteoComponent],
  imports: [CommonModule, CriteoAlignmentModule, CriteoAlignmentServiceModule, DeliveryInformationStoreServiceModule],
  exports: [PlanReviewCriteoComponent],
})
export class PlanReviewCriteoModule {}
