import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { Action, ActionReducer, StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { PlanReviewEffect } from './plan-review.effect';
import { planReviewReducer } from './plan-review.reducer';
import { PLAN_REVIEW_STORE_NAME, PlanReviewState } from './plan-review.state';

/** Token of the PlanReview reducer */
export const PLAN_REVIEW_REDUCER_TOKEN = new InjectionToken<ActionReducer<PlanReviewState, Action>>(
  'Feature PlanReview Reducer'
);

/** Provide default reducer for PlanReview store */
export function getDefaultPlanReviewReducer() {
  return planReviewReducer;
}

@NgModule({
  imports: [
    StoreModule.forFeature(PLAN_REVIEW_STORE_NAME, PLAN_REVIEW_REDUCER_TOKEN),
    EffectsModule.forFeature([PlanReviewEffect]),
  ],
  providers: [{ provide: PLAN_REVIEW_REDUCER_TOKEN, useFactory: getDefaultPlanReviewReducer }],
})
export class PlanReviewStoreModule {
  public static forRoot<T extends PlanReviewState>(
    reducerFactory: () => ActionReducer<T, Action>
  ): ModuleWithProviders<PlanReviewStoreModule> {
    return {
      ngModule: PlanReviewStoreModule,
      providers: [{ provide: PLAN_REVIEW_REDUCER_TOKEN, useFactory: reducerFactory }],
    };
  }
}
