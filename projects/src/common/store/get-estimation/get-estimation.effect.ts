import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from } from 'rxjs/internal/observable/from';
import { of } from 'rxjs/internal/observable/of';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelGetEstimationRequest,
  failGetEstimation,
  setGetEstimation,
  setGetEstimationFromApi,
  updateGetEstimation,
  updateGetEstimationFromApi,
} from './get-estimation.actions';

/**
 * Service to handle async GetEstimation actions
 */
@Injectable()
export class GetEstimationEffect {
  /**
   * Set the state with the reply content, dispatch failGetEstimation if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setGetEstimationFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setGetEstimation({ ...reply, requestId: action.requestId }),
        (error, action) => of(failGetEstimation({ error, requestId: action.requestId })),
        cancelGetEstimationRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failGetEstimation if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateGetEstimationFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateGetEstimation({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failGetEstimation({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
