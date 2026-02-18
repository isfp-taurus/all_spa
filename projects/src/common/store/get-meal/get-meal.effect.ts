import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelGetMealRequest,
  failGetMeal,
  setGetMeal,
  setGetMealFromApi,
  updateGetMeal,
  updateGetMealFromApi,
} from './get-meal.actions';

/**
 * Service to handle async GetMeal actions
 */
@Injectable()
export class GetMealEffect {
  /**
   * Set the state with the reply content, dispatch failGetMeal if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setGetMealFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setGetMeal({ ...reply, requestId: action.requestId }),
        (error, action) => of(failGetMeal({ error, requestId: action.requestId })),
        cancelGetMealRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failGetMeal if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateGetMealFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateGetMeal({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failGetMeal({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
