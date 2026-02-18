import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelRoundtripFppRequest,
  failRoundtripFpp,
  setRoundtripFpp,
  setRoundtripFppFromApi,
  updateRoundtripFpp,
  updateRoundtripFppFromApi,
} from './roundtrip-fpp.actions';

/**
 * Service to handle async RoundtripFpp actions
 */
@Injectable()
export class RoundtripFppEffect {
  /**
   * Set the state with the reply content, dispatch failRoundtripFpp if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setRoundtripFppFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setRoundtripFpp({ model: reply, requestId: action.requestId }),
        (error, action) => of(failRoundtripFpp({ error, requestId: action.requestId })),
        cancelRoundtripFppRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failRoundtripFpp if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateRoundtripFppFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateRoundtripFpp({ model: reply, requestId: payload.requestId })),
          catchError((err) => of(failRoundtripFpp({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
