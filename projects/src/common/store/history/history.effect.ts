import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '@lib/store';
import {
  cancelHistoryRequest,
  failHistory,
  setHistory,
  setHistoryFromApi,
  updateHistory,
  updateHistoryFromApi,
} from './history.actions';

/**
 * Service to handle async History actions
 */
@Injectable()
export class HistoryEffect {
  /**
   * Set the state with the reply content, dispatch failHistory if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setHistoryFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setHistory({ ...reply, requestId: action.requestId }),
        (error, action) => of(failHistory({ error, requestId: action.requestId })),
        cancelHistoryRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failHistory if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateHistoryFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateHistory({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failHistory({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
