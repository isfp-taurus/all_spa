import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelRoundtripOwdDisplayRequest,
  failRoundtripOwdDisplay,
  setRoundtripOwdDisplay,
  setRoundtripOwdDisplayFromApi,
  updateRoundtripOwdDisplay,
  updateRoundtripOwdDisplayFromApi,
} from './roundtrip-owd-display.actions';

/**
 * Service to handle async RoundtripOwd actions
 */
@Injectable()
export class RoundtripOwdDisplayEffect {
  /**
   * Set the state with the reply content, dispatch failRoundtripOwdDisplay if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setRoundtripOwdDisplayFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setRoundtripOwdDisplay({ ...reply, requestId: action.requestId }),
        (error, action) => of(failRoundtripOwdDisplay({ error, requestId: action.requestId })),
        cancelRoundtripOwdDisplayRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failRoundtripOwdDisplay if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateRoundtripOwdDisplayFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateRoundtripOwdDisplay({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failRoundtripOwdDisplay({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
