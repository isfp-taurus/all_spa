import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelRoundtripOwdRequest,
  failRoundtripOwd,
  setRoundtripOwd,
  setRoundtripOwdFromApi,
  updateRoundtripOwd,
  updateRoundtripOwdFromApi,
} from './roundtrip-owd.actions';

/**
 * Service to handle async RoundtripOwd actions
 */
@Injectable()
export class RoundtripOwdEffect {
  /**
   * Set the state with the reply content, dispatch failRoundtripOwd if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setRoundtripOwdFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setRoundtripOwd({ ...reply, requestId: action.requestId }),
        (error, action) => of(failRoundtripOwd({ error, requestId: action.requestId })),
        cancelRoundtripOwdRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failRoundtripOwd if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateRoundtripOwdFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateRoundtripOwd({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failRoundtripOwd({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
