import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelCreatePlansRequest,
  failCreatePlans,
  setCreatePlans,
  setCreatePlansFromApi,
  updateCreatePlans,
  updateCreatePlansFromApi,
} from './create-plans.actions';

/**
 * Service to handle async CreatePlans actions
 */
@Injectable()
export class CreatePlansEffect {
  /**
   * Set the state with the reply content, dispatch failCreatePlans if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setCreatePlansFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setCreatePlans({ ...reply, requestId: action.requestId }),
        (error, action) => of(failCreatePlans({ error, requestId: action.requestId })),
        cancelCreatePlansRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failCreatePlans if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateCreatePlansFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateCreatePlans({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failCreatePlans({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
