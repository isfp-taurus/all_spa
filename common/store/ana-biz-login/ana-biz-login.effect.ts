import { Injectable } from '@angular/core';
import { fromApiEffectSwitchMap } from '@lib/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import {
  cancelAnaBizLoginRequest,
  failAnaBizLogin,
  setAnaBizLogin,
  setAnaBizLoginFromApi,
  updateAnaBizLogin,
  updateAnaBizLoginFromApi,
} from './ana-biz-login.actions';

/**
 * Service to handle async AnaBizLogin actions
 */
@Injectable()
export class AnaBizLoginEffect {
  /**
   * Set the state with the reply content, dispatch failAnaBizLogin if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setAnaBizLoginFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setAnaBizLogin({ ...reply, requestId: action.requestId }),
        (error, action) => of(failAnaBizLogin({ error, requestId: action.requestId })),
        cancelAnaBizLoginRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failAnaBizLogin if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateAnaBizLoginFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateAnaBizLogin({ ...reply, requestId: payload.requestId })),
          catchError((err) => of(failAnaBizLogin({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
