import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelPlanReviewRequest,
  failPlanReview,
  setPlanReview,
  setPlanReviewFromApi,
  updatePlanReview,
  updatePlanReviewFromApi,
} from './plan-review.actions';

/**
 * Service to handle async PlanReview actions
 */
@Injectable()
export class PlanReviewEffect {
  /**
   * Set the state with the reply content, dispatch failPlanReview if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setPlanReviewFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setPlanReview({ ...reply, requestId: action.requestId }),
        (error, action) => of(failPlanReview({ error, requestId: action.requestId })),
        cancelPlanReviewRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failPlanReview if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatePlanReviewFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updatePlanReview({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failPlanReview({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
