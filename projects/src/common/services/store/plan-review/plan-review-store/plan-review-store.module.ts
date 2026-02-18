import { NgModule } from '@angular/core';
import { PlanReviewStoreModule } from '@common/store';
import { EffectsModule } from '@ngrx/effects';
import { PlanReviewStoreService } from './plan-review-store.service';

@NgModule({
  providers: [PlanReviewStoreService],
  imports: [PlanReviewStoreModule, EffectsModule.forRoot()],
})
export class PlanReviewStoreServiceModule {}
