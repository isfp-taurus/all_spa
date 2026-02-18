import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticMsgModule } from '@lib/pipes';
import { ButtonModule } from '@lib/components';
import { PlanReviewFooterComponent } from './plan-review-footer.component';
import { ModalServiceModule } from '@lib/services';
import { ThrottleClickDirectiveModule } from '@lib/directives';

@NgModule({
  declarations: [PlanReviewFooterComponent],
  imports: [CommonModule, ButtonModule, StaticMsgModule, ModalServiceModule, ThrottleClickDirectiveModule],
  exports: [PlanReviewFooterComponent],
})
export class PlanReviewFooterModule {}
