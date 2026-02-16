import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelCurrentPlanRequest,
  failCurrentPlan,
  setCurrentPlan,
  setCurrentPlanFromApi,
  updateCurrentPlan,
  updateCurrentPlanFromApi,
} from './current-plan.actions';

/**
 * Service to handle async CurrentPlan actions
 */
@Injectable()
export class CurrentPlanEffect {
  /**
   * Set the state with the reply content, dispatch failCurrentPlan if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setCurrentPlanFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setCurrentPlan({ ...reply, requestId: action.requestId }),
        (error, action) => of(failCurrentPlan({ error, requestId: action.requestId })),
        cancelCurrentPlanRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failCurrentPlan if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCurrentPlanFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateCurrentPlan({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failCurrentPlan({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
