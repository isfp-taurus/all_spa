import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelGetPlansRequest,
  failGetPlans,
  setGetPlans,
  setGetPlansFromApi,
  updateGetPlans,
  updateGetPlansFromApi,
} from './get-plans.actions';

/**
 * Service to handle async GetPlans actions
 */
@Injectable()
export class GetPlansEffect {
  /**
   * Set the state with the reply content, dispatch failGetPlans if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setGetPlansFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setGetPlans({ ...reply, requestId: action.requestId }),
        (error, action) => of(failGetPlans({ error, requestId: action.requestId })),
        cancelGetPlansRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failGetPlans if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateGetPlansFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateGetPlans({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failGetPlans({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
