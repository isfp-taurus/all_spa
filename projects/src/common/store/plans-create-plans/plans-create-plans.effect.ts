import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelPlansCreatePlansRequest,
  failPlansCreatePlans,
  setPlansCreatePlans,
  setPlansCreatePlansFromApi,
  updatePlansCreatePlans,
  updatePlansCreatePlansFromApi,
} from './plans-create-plans.actions';

/**
 * Service to handle async PlansCreatePlans actions
 */
@Injectable()
export class PlansCreatePlansEffect {
  /**
   * Set the state with the reply content, dispatch failPlansCreatePlans if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setPlansCreatePlansFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setPlansCreatePlans({ ...reply, requestId: action.requestId }),
        (error, action) => of(failPlansCreatePlans({ error, requestId: action.requestId })),
        cancelPlansCreatePlansRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failPlansCreatePlans if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updatePlansCreatePlansFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updatePlansCreatePlans({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failPlansCreatePlans({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
