import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelFareConditionsRequest,
  failFareConditions,
  setFareConditions,
  setFareConditionsFromApi,
  updateFareConditions,
  updateFareConditionsFromApi,
} from './fare-conditions.actions';

/**
 * Service to handle async FareConditions actions
 */
@Injectable()
export class FareConditionsEffect {
  /**
   * Set the state with the reply content, dispatch failFareConditions if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setFareConditionsFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setFareConditions({ ...reply, requestId: action.requestId }),
        (error, action) => of(failFareConditions({ error, requestId: action.requestId })),
        cancelFareConditionsRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failFareConditions if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateFareConditionsFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateFareConditions({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failFareConditions({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
