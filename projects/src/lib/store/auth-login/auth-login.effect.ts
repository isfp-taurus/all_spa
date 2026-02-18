import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { fromApiEffectSwitchMap } from '../common/async/async.operators';
import {
  cancelAuthLoginRequest,
  failAuthLogin,
  setAuthLogin,
  setAuthLoginFromApi,
  updateAuthLogin,
  updateAuthLoginFromApi,
} from './auth-login.actions';

/**
 * Service to handle async AuthLogin actions
 */
@Injectable()
export class AuthLoginEffect {
  /**
   * Set the state with the reply content, dispatch failAuthLogin if it catches a failure
   */
  public setFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(setAuthLoginFromApi),
      fromApiEffectSwitchMap(
        (reply, action) => setAuthLogin({ model: reply, requestId: action.requestId }),
        (error, action) => of(failAuthLogin({ error, requestId: action.requestId })),
        cancelAuthLoginRequest
      )
    )
  );

  /**
   * Update the state with the reply content, dispatch failAuthLogin if it catches a failure
   */
  public updateFromApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateAuthLoginFromApi),
      mergeMap((payload) =>
        from(payload.call).pipe(
          map((reply) => updateAuthLogin({ model: reply, requestId: payload.requestId })),
          catchError((err) => of(failAuthLogin({ error: err, requestId: payload.requestId })))
        )
      )
    )
  );

  constructor(protected actions$: Actions) {}
}
