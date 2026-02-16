import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiffEmphService } from './diff-emph.service';
import { CurrentCartStoreServiceModule } from '../store/common/current-cart-store/current-cart-store.module';
import { PlanReviewStoreServiceModule } from '../store/plan-review/plan-review-store/plan-review-store.module';

@NgModule({
  providers: [DiffEmphService],
  imports: [CommonModule, CurrentCartStoreServiceModule, PlanReviewStoreServiceModule],
})
export class DiffEmphServiceModule {}
